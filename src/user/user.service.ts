import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { UsuarioCrear } from './dto/userCrear.dto';
import { EditarUsuario, ModificarRole } from './interface/usuario.interface';
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
        skip: offset ?? 0
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

  // Crea un nuevo usuario junto con sus datos por defecto asociados.
  // Utiliza una transacción para asegurar la integridad de los datos.
  // Crea por defecto bancos, clasificaciones y convenios para el nuevo usuario.
  async createUsuario(datos: UsuarioCrear, qR: QueryRunner): Promise<User> {
    try {
      const usuario: User = new User();
      usuario.nombre = datos.nombre;
      usuario.email = datos.email;
      usuario.password = datos.password;
      usuario.role = Role.Operador;

      const newUsuario: User = await qR.manager.save(User, usuario);
      if (!newUsuario) throw new NotFoundException(`Error al intentar crear el dato ${datos.nombre} en usuario`)

      return newUsuario;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar crear el dato ${datos.nombre} en usuario`)
    }
  }

  // Actualiza los datos de un usuario existente.
  // Lanza una excepción si el usuario no existe.
  async updateUsuario(dto: EditarUsuario, qR: QueryRunner): Promise<User> {
    try {
      const usuario: User = await this.getDatoByIdOrFail(dto.id, qR);
      usuario.nombre = dto.datos.nombre;
      usuario.email = dto.datos.email;
      usuario.password = dto.datos.password;

      return await qR.manager.save(User, usuario);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar actualizar el dato con ${dto.id} de usuario`)
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
