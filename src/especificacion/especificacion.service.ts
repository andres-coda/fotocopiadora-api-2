import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, In, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { Especificacion } from './entity/especificacion.entity';
import { DtoEspecificacionCrear } from './dto/DtoCrearEspecificacion.dto';
import { Especificaciones } from '../pedido_item/interface/especificaciones.interface';
import { DtoEspecificaionRetorno } from './dto/DtoEspecificacionRetorno.dto';
import { CreateGenericoProp, GetGenericoByIdProp, UpdateGenericoProp } from '@src/interface/general.interface';

export interface GetEspNombresProp extends Pick<GetGenericoByIdProp, 'qR'> {
  nombres: Especificaciones[];
}

@Injectable()
export class EspecificacionService {
  constructor(
    @InjectRepository(Especificacion) private readonly especificacionRepository: Repository<Especificacion>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) { }

  async getEspecificacionByNombre({ id, qR }: GetGenericoByIdProp): Promise<Especificacion | undefined> {
    try {
      const criterio: FindOneOptions = {
        where: { nombre: id }
      }

      const esp: Especificacion | undefined = await qR.manager.findOne(Especificacion, criterio);

      return esp;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar buscar por nombre la especificacion ${id}`)
    }
  }

  async getEspecificaciones(qR:QueryRunner ): Promise<Especificacion[]> {
    try {
      const criterio: FindManyOptions = {
        where: {deleted: false}
      }

      const esp: Especificacion[ ]= await qR.manager.find(Especificacion, criterio);

      return esp;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer todas las especificaciones`)
    }
  }

  async getEspecificacionesByNombres({ nombres, qR }: GetEspNombresProp): Promise<Especificacion[]> {
    try {
      const criterio: FindManyOptions = {
        where: { nombre: In(nombres) }
      }

      const esp: Especificacion[] = await qR.manager.find(Especificacion, criterio);

      return esp;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar buscar por nombres las especificaciones`)
    }
  }

  async getEspecificacionById({ id, qR }: GetGenericoByIdProp): Promise<Especificacion | undefined> {
    try {
      const criterio: FindOneOptions = {
        where: { id: id }
      }
      const esp: Especificacion | undefined = await qR.manager.findOne(Especificacion, criterio);
      return esp;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar buscar por id la especificacion ${id}`)
    }
  }

  async getEspecificacionByIdOrFaild({ id, qR }: GetGenericoByIdProp): Promise<Especificacion> {
    try {
      const esp: Especificacion | undefined = await this.getEspecificacionById({ id, qR });

      if (!esp) throw new NotFoundException(`No se encontro la especificación con el id ${id}`);

      if (esp.deleted === true) throw new NotFoundException(`La especificación con id ${id} fue eliminada`);

      return esp;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar buscar por id la especificacion ${id}`)
    }
  }

  async createEspecificacion({ dto, qR }: CreateGenericoProp<DtoEspecificacionCrear>): Promise<Especificacion> {
    try {
      const espExiste: Especificacion | undefined = await this.getEspecificacionByNombre({
        id: dto.nombre,
        qR
      });

      if (espExiste) return espExiste;

      const especificacion: Especificacion = new Especificacion();
      especificacion.nombre = dto.nombre;

      const newEspecificacion: Especificacion = await qR.manager.save(Especificacion, especificacion);

      return newEspecificacion;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear la especificación ${dto.nombre}`)
    }
  }

  async createEspecificacionCx({ dto, qR }: CreateGenericoProp<DtoEspecificacionCrear>): Promise<DtoEspecificaionRetorno> {
    try {
      const esp: Especificacion = await this.createEspecificacion({
        dto,
        qR
      });

      const newEsp = this.remplaceToReturn(esp);
      if(!newEsp) throw new NotFoundException(`No se pudo crear la especificación ${dto.nombre}`)
      
        return newEsp;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear la especificación ${dto.nombre} en el crear especificación controller`)
    }
  }

  async updateEspecificacion({ dto, qR, id }: UpdateGenericoProp<DtoEspecificacionCrear>): Promise<Especificacion> {
    try {
      const especificacion: Especificacion = await this.getEspecificacionByIdOrFaild({ id, qR });

      if (dto.nombre === especificacion.nombre) return especificacion;

      especificacion.nombre = dto.nombre;

      const newEspecificacion: Especificacion = await qR.manager.save(Especificacion, especificacion);

      return newEspecificacion;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar la especificación ${dto.nombre}`)
    }
  }

  async getEspecificacionesCx(qR: QueryRunner):Promise<DtoEspecificaionRetorno[]>{
    try{
      const esp:Especificacion[] = await this.getEspecificaciones(qR);
      return esp.map(e=> this.remplaceToReturn(e));
    } catch(er) {
      throw this.erroresService.handleExceptions(er,'Error al intentar leer las especificaciones para el controlador')
    }
  }

  remplaceToReturn(entidad: Especificacion): DtoEspecificaionRetorno {
    return {
      id: entidad.id,
      nombre: entidad.nombre,
      deleted: entidad.deleted ?? false
    }
  }
}
