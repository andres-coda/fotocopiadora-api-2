import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Precio } from './entity/precio.entity';
import { DtoPrecioCrear } from './dto/precioCrear.dto';
import { DtoPrecioEditar } from './dto/precioEditar.dto';
import { PRECIO_RELATIONS, PRECIO_SELECTED } from './default/relacion';
import { DtoPrecioRespuesta } from './dto/precioRetorno.dto';
import { DtoBaseRetorno } from '../base/dto/baseRetorno.dto';

@Injectable()
export class PrecioService extends BaseService<typeof Entidad.PRECIO, Precio, DtoPrecioCrear, DtoPrecioEditar> {
  constructor(
    @InjectRepository(Precio) private readonly precioRepository: Repository<Precio>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(precioRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ dto, qR, entidad }: CreateProp<DtoPrecioCrear, typeof Entidad.PRECIO>): Promise<Precio> {
    try {
      const precioExistente: Precio | null = await this.getDatoByName({
        dato: dto.nombre,
        qR,
        relaciones: [PRECIO_RELATIONS],
        selected: PRECIO_SELECTED,
        entidadError: 'precio'
      });

      if (precioExistente) return precioExistente;

      const precio: Precio = new Precio();
      precio.nombre = dto.nombre;
      precio.descripcion = dto.descripcion;

      const newPrecio: Precio = qR
        ? await qR.manager.save(Precio, precio)
        : await this.precioRepository.save(precio);

      return newPrecio;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Precio, DtoPrecioEditar, typeof Entidad.PRECIO>): Promise<UpdateRetorno<Precio>> {
    try {
      const precio: Precio = await this.getDatoByIdOrFail({
        id,
        qR,
        relaciones,
        selected,
        entidadError
      });
      if(precio.descripcion && precio.descripcion.length != 0 ) {
        throw new NotFoundException('No puede editar el nombre de los precios usados para calcular el valor de los libros');
      }
      if(!dto.nombre || precio.nombre === dto.nombre) return {dato:precio, isQr:false};
      
      precio.nombre = dto.nombre;

      const newPrecio: Precio = qR
        ? await qR.manager.save(Precio, precio)
        : await this.precioRepository.save(precio);

      return { dato: newPrecio, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de precios`)
    }
  }

  remplaceToReturn(entidad: Precio): DtoPrecioRespuesta {
    const base: DtoBaseRetorno = this.remplaceToBase(entidad);

    return {
      ...base,
      nombre: entidad.nombre,
      descripcion: entidad.descripcion,
    }
  }
}
