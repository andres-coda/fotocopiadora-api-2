import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { UsuarioCrear } from './dto/userCrear.dto';
import { Role } from '../auth/rol/rol.enum';
import { EditarUsuario, ModificarRole } from './interface/usuario.interface';
import { Materia } from '@src/materia/entity/materia.entity';
import { MateriaService } from '@src/materia/materia.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usuarioRepository: Repository<User>,
    @InjectDataSource() private readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gateway: GatewayGateway,
    private readonly materiaService: MateriaService,
  ) {
  }

  async getDatoByIdOrFail(id: string): Promise<User> {
    try {
      const dato: User | null = await this.getDatoById(id);
      if (!dato) throw new NotFoundException('No se encontro el usuario en la base de datos');
      if (dato.deleted) throw new NotFoundException('El usuario ha sido eliminado con anterioridad');
      return dato;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el usuario con id ${id}`)
    }
  }

  async getDatoById(id: string): Promise<User | null> {
    try {
      const criterio: FindOneOptions = {
        where: {
          id: id,
        }
      }

      return await this.usuarioRepository.findOne(criterio);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el dato con id ${id} en usuario`)
    }
  }

  // Obtiene un usuario por su email.
  async getUserByEmail(email: string): Promise<User> {
    try {
      const criterio: FindOneOptions = {
        where: {
          email: email,
        }
      }
      const newUser: User | null = await this.usuarioRepository.findOne(criterio);
      if (!newUser) throw new NotFoundException(`No se encontro el usuario ${email}`);

      return newUser;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `No se encontro el usuario ${email}`)
    }
  }

  // Crea un nuevo usuario junto con sus datos por defecto asociados.
  // Utiliza una transacción para asegurar la integridad de los datos.
  // Crea por defecto bancos, clasificaciones y convenios para el nuevo usuario.
  async createUsuario(datos: UsuarioCrear): Promise<User> {
    const qR: QueryRunner = this.dataSource.createQueryRunner();
    await qR.connect();
    await qR.startTransaction();
    try {
      const usuario: User = new User();
      usuario.nombre = datos.nombre;
      usuario.email = datos.email;
      usuario.password = datos.password;
      usuario.role = 'admin';

      const newUsuario: User = await qR.manager.save(User, usuario);
      if (!newUsuario) throw new NotFoundException(`Error al intentar crear el dato ${datos.nombre} en usuario`)

      const materias:Materia[] = await this.materiaService.createMateriaDefault({usuario:newUsuario, qR})
      await qR.commitTransaction();

      return newUsuario;
    } catch (error) {
      await qR.rollbackTransaction();
      throw this.erroresService.handleExceptions(error, `Error al intentar crear el dato ${datos.nombre} en usuario`)
    } finally {
      await qR.release();
    }
  }

  // Actualiza los datos de un usuario existente.
  // Lanza una excepción si el usuario no existe.
  async updateUsuario(dto:EditarUsuario): Promise<User> {
    try {
      const usuario: User = await this.getDatoByIdOrFail(dto.id);
      usuario.nombre = dto.datos.nombre;
      usuario.email = dto.datos.email;
      usuario.password = dto.datos.password;

      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar actualizar el dato con ${dto.id} de usuario`)
    }
  }

  // Modifica el rol de un usuario.
  async modifyUsuarioRole(dto:ModificarRole): Promise<User> {
    try {
      const usuario: User = await this.getDatoByIdOrFail(dto.id);
      usuario.role = dto.role;

      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar modificar el rol al usuario ${dto.id}`)
    }
  }

}
