import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { UsuarioCrear } from './dto/userCrear.dto';
import { Role } from '../auth/rol/rol.enum';

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
  async updateUsuario(id: string, datos: UsuarioCrear): Promise<User> {
    try {
      const usuario: User = await this.getDatoByIdOrFail(id);
      usuario.nombre = datos.nombre;
      usuario.email = datos.email;
      usuario.password = datos.password;

      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar actualizar el dato con ${id} de usuario`)
    }
  }

  // Modifica el rol de un usuario.
  async modifyUsuarioRole(id: string, role: Role): Promise<User> {
    try {
      const usuario: User = await this.getDatoByIdOrFail(id);
      usuario.role = role;

      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar modificar el rol al usuario ${id}`)
    }
  }

}
