import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, In, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, GetIdsProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Especificacion } from './entity/especificacion.entity';
import { DtoEspecificacionCrear } from './dto/DtoCrearEspecificacion.dto';
import { DtoEspecificacionEditar } from './dto/DtoEditarEspecificacion.dto';
import { ESPECIFICACION_RELATIONS, SELECTED_ESPECIFICACION } from './default/relacion.default';
import { Especificaciones } from '../libro_pedido/interface/especificaciones.interface';
import { DtoEspecificaionRetorno } from './dto/DtoEspecificacionRetorno.dto';
import { DtoBaseRetorno } from '@src/base/dto/baseRetorno.dto';

export interface GetEspNombres extends Omit<GetIdsProp<Especificacion>, 'ids'> {
  nombres: Especificaciones[]
}

@Injectable()
export class EspecificacionService extends BaseService<typeof Entidad.ESP,Especificacion, DtoEspecificacionCrear, DtoEspecificacionEditar, DtoEspecificaionRetorno> {
  constructor(
    @InjectRepository(Especificacion) private readonly especificacionRepository: Repository<Especificacion>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(especificacionRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ usuario, dto, qR, entidad }: CreateProp<DtoEspecificacionCrear,typeof Entidad.ESP>): Promise<Especificacion> {
    try {
      const espExiste: Especificacion | null = await this.getDatoByName({
        dato: dto.nombre,
        usuarioId: usuario.id,
        qR,
        relaciones: [ESPECIFICACION_RELATIONS],
        selected: SELECTED_ESPECIFICACION,
        entidadError: 'especificacion'
      });

      if (espExiste) return espExiste;

      const especificacion: Especificacion = new Especificacion();
      especificacion.nombre = dto.nombre;
      especificacion.user = usuario;

      const newEspecificacion: Especificacion = qR
        ? await qR.manager.save(Especificacion, especificacion)
        : await this.especificacionRepository.save(especificacion);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad: entidad,
          dato: newEspecificacion
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return newEspecificacion;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Especificacion, DtoEspecificacionEditar, typeof Entidad.ESP>): Promise<UpdateRetorno<Especificacion>> {
    try {
      const especificacion: Especificacion = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        relaciones,
        selected,
        entidadError
      });

      especificacion.nombre = dto.nombre;

      const newEspecificacion: Especificacion = qR
        ? await qR.manager.save(Especificacion, especificacion)
        : await this.especificacionRepository.save(especificacion);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad: entidad,
          dato: newEspecificacion
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return {dato: especificacion, isQr:true };

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre} en el registro de especificacions`)
    }
  }

  async getDatosByNombres({ nombres, entidadError, relaciones, qR, usuarioId, selected }: GetEspNombres): Promise<Especificacion[]> {
    try {
      if (nombres.length == 0) return [];
      const criterio: FindManyOptions = this.crearCriterio<FindManyOptions>({
        relaciones,
        selected,
        where: { nombre: In(nombres) },
        usuarioId,
      });

      const target = this.especificacionRepository.target;

      const esp: Especificacion[] = qR
        ? await qR.manager.find(target, criterio)
        : await this.especificacionRepository.find(criterio)

      return esp;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer las especificaciones en base de datos`)
    }
  }

  remplaceToReturn(entidad: Especificacion): DtoEspecificaionRetorno {
    const base: DtoBaseRetorno = this.remplaceToBase(entidad);

    return {
      ...base,

      nombre: entidad.nombre
    }
  }
}
