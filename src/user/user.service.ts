import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityTarget, FindOneOptions, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { GetIdProp } from '@src/base/interface/base.interface';

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

  async getDatoByIdOrFail({ id, qR, relaciones, entidadError }: GetIdProp<User>): Promise<User> {
    try {
      const dato: User | null = await this.getDatoById({ id, qR, relaciones, entidadError });
      if (!dato) throw new NotFoundException('No se encontro el usuario en la base de datos');
      if (dato.deleted) throw new NotFoundException('El usuario ha sido eliminado con anterioridad');
      return dato;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el usuario con id ${id} ${entidadError && `de ${entidadError}`}`)
    }
  }

  async getDatoById({ id, qR, relaciones = [], entidadError }: GetIdProp<User>): Promise<User | null> {
    try {
      const criterio: FindOneOptions = {
        relations: relaciones as string[],
        where: {
          id: id,
        } as any
      }
      if (qR) {
        const target: EntityTarget<User> = this.usuarioRepository.target;
        return await qR.manager.findOne<User>(target, criterio);
      }

      return await this.usuarioRepository.findOne(criterio);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el dato con id ${id} ${entidadError && `de ${entidadError}`}`)
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
}
