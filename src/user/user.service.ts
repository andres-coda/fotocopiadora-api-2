import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { UsuarioCrear } from './dto/userCrear.dto';
import { EditarUsuarioDto } from './dto/userEditar.dto';
import { ModificarRole } from './interface/usuario.interface';
import { Role } from '@src/auth/rol/rol.enum';
import { GetGenericoProp, RetornoGenericoControllerGet, RetornoGenericoServiceGet } from '@src/interface/general.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usuarioRepository: Repository<User>,
    @InjectDataSource() private readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gateway: GatewayGateway,
  ) {
  }

  async getUsuarios({ qR, limite, offset }: GetGenericoProp): Promise<RetornoGenericoServiceGet<User>> {
    try {
 
      const criterio: FindManyOptions = {
        take: limite ?? 20,
        skip: offset ?? 0,
        // El listado es el ABM de la empresa: un usuario dado de baja no
        // aparece. Antes el front lo daba por hecho y el back no lo filtraba.
        where: { deleted: false },
      }

      const [datos, total] = await qR.manager.findAndCount(User, criterio);

      return {
        datos, total
      }
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer todos los usuarios`)
    }
  }

  async getDatoByIdOrFail(id: string, qR: QueryRunner): Promise<User> {
    try {
      const dato: User | null = await this.getDatoById(id, qR);
      if (!dato) throw new NotFoundException('No se encontro el usuario en la base de datos');
      if (dato.deleted) throw new NotFoundException('El usuario ha sido eliminado con anterioridad');
      return dato;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el usuario con id ${id}`)
    }
  }

  async getDatoById(id: string, qR: QueryRunner): Promise<User | null> {
    try {
      const criterio: FindOneOptions = {
        where: {
          id: id,
        }
      }

      return await qR.manager.findOne(User, criterio);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el dato con id ${id} en usuario`)
    }
  }

  // Obtiene un usuario por su email.
  async getUserByEmail(email: string, qR: QueryRunner): Promise<User> {
    try {
      const criterio: FindOneOptions = {
        where: {
          email: email,
        }
      }
      const newUser: User | null = await qR.manager.findOne(User, criterio);
      if (!newUser) throw new NotFoundException(`No se encontro el usuario ${email}`);

      return newUser;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `No se encontro el usuario ${email}`)
    }
  }

  // Crea un nuevo usuario dentro de la empresa del administrador que lo pide.
  // La contrasena se hashea en Postgres (pgcrypto), no en Node: el paquete
  // bcrypt de npm emite hashes con prefijo $2b$, que pgcrypto no verifica, y
  // tendriamos dos criterios de validez para la misma columna.
  async createUsuario(
    datos: UsuarioCrear,
    idEmpresa: string | null | undefined,
    qR: QueryRunner,
  ): Promise<User> {
    try {
      // Solo admin u operador. super_admin queda fuera del contrato y el RLS
      // tambien lo rechaza en pc_usuario_insert.
      const rol = datos.role === Role.Admin ? Role.Admin : Role.Operador;

      const filas: User[] = await qR.manager.query(
        `insert into usuario (nombre, email, password_hash, rol, id_empresa)
         values ($1, $2, public.crypt($3, public.gen_salt('bf', 10)), $4, coalesce($5::uuid, fc_empresa_actual()))
         returning id,
                   fecha_creacion      as "fechaCreacion",
                   fecha_actualizacion as "fechaActualizacion",
                   deleted,
                   nombre,
                   email,
                   rol                 as role,
                   id_empresa          as "idEmpresa"`,
        [datos.nombre, datos.email, datos.password, rol, idEmpresa ?? null],
      );

      const newUsuario = filas[0];
      if (!newUsuario) throw new BadRequestException('No se pudo crear el usuario');

      return newUsuario;
    } catch (error) {
      throw this.erroresService.handleExceptions(
        this.traducirConflicto(error, `Ya existe un usuario con ese nombre o email`),
        `Error al intentar crear el dato ${datos.nombre} en usuario`
      )
    }
  }

  // Actualiza los datos del propio usuario logueado.
  // Si viene contrasena nueva, primero verifica la actual.
  // El rol y el id_empresa no se tocan: el with check de pc_usuario_update
  // rechaza cualquier intento de moverlos desde el perfil propio.
  async updateUsuario(dto: EditarUsuarioDto, qR: QueryRunner): Promise<User> {
    try {
      const { id, datos } = dto;

      if (datos.passwordNueva && !datos.passwordActual) {
        throw new BadRequestException('Para cambiar la contraseña hay que indicar la actual');
      }
      if (datos.passwordActual && !datos.passwordNueva) {
        throw new BadRequestException('Falta la nueva contraseña');
      }

      if (datos.passwordNueva) {
        await this.verificarPasswordActual(id, datos.passwordActual as string, qR);
      }

      const filas: User[] = await qR.manager.query(
        `update usuario
            set nombre              = $2,
                email               = $3,
                password_hash       = coalesce(public.crypt($4, public.gen_salt('bf', 10)), password_hash),
                fecha_actualizacion = now()
          where id = $1
          returning id,
                    fecha_creacion      as "fechaCreacion",
                    fecha_actualizacion as "fechaActualizacion",
                    deleted,
                    nombre,
                    email,
                    rol                 as role,
                    id_empresa          as "idEmpresa"`,
        [id, datos.nombre, datos.email, datos.passwordNueva ?? null],
      );

      const actualizado = filas[0];
      if (!actualizado) throw new NotFoundException('No se encontro el usuario en la base de datos');

      return actualizado;
    } catch (error) {
      throw this.erroresService.handleExceptions(
        this.traducirConflicto(error, 'Ese email ya esta en uso'),
        `Error al intentar actualizar el dato con ${dto.id} de usuario`
      )
    }
  }

  /**
   * Postgres devuelve 23505 ante un unique violado, que sin traducir sale como
   * 500. `usuario` tiene `uq_nombre` (nombre + empresa) y `uk_email` (global),
   * y ese es el error que un admin ve primero al dar de alta.
   *
   * Se devuelve un HttpException y no un ConflictException porque
   * ErroresService reemplaza el mensaje de ConflictException por uno generico.
   */
  private traducirConflicto(error: any, mensaje: string): any {
    if (error?.code === '23505') {
      return new HttpException(
        { status: HttpStatus.CONFLICT, message: mensaje, error: error.detail },
        HttpStatus.CONFLICT,
      );
    }
    return error;
  }

  /**
   * Comprueba la contrasena actual contra el hash guardado con la misma funcion
   * que usa fc_login (crypt), para no tener dos criterios de validez.
   *
   * Devuelve un booleano en vez de llamar a fc_login porque esa funcion lanza
   * una excepcion cuando la clave es incorrecta, y esa excepcion abortaria la
   * transaccion del request: el rollback del interceptor descartaria el cambio
   * antes de que el usuario pudiera ver el 401.
   */
  private async verificarPasswordActual(
    id: string,
    password: string,
    qR: QueryRunner,
  ): Promise<void> {
    const filas: { ok: boolean | null }[] = await qR.manager.query(
      `select (password_hash = public.crypt($2, password_hash)) as ok
         from usuario
        where id = $1`,
      [id, password],
    );

    if (filas[0]?.ok !== true) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }
  }

  // Modifica el rol de un usuario.
  async modifyUsuarioRole(dto: ModificarRole, qR: QueryRunner): Promise<User> {
    try {
      const usuario: User = await this.getDatoByIdOrFail(dto.id, qR);
      usuario.role = dto.role;

      return await qR.manager.save(User, usuario);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar modificar el rol al usuario ${dto.id}`)
    }
  }

}
