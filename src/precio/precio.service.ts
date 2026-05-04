import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateDefaultProp, CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Precio } from './entity/precio.entity';
import { DtoPrecioCrear } from './dto/precioCrear.dto';
import { DtoPrecioEditar } from './dto/precioEditar.dto';
import { PRECIO_RELATIONS, PRECIO_SELECTED } from './default/relacion';
import { PRECIO_DEFAULT } from './default/precio.default';

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

  async createDato({ usuario, dto, qR, entidad }: CreateProp<DtoPrecioCrear, typeof Entidad.PRECIO>): Promise<Precio> {
    try {
      const precioExistente: Precio | null = await this.getDatoByName({
        dato: dto.nombre,
        usuarioId: usuario.id,
        qR,
        relaciones: [PRECIO_RELATIONS],
        selected: PRECIO_SELECTED,
        entidadError: 'precio'
      });

      console.log(`Precio de ${dto.nombre} existente: ${precioExistente?.nombre || 'no existe'}`)

      if (precioExistente) return precioExistente;

      const precio: Precio = new Precio();
      precio.nombre = dto.nombre;
      precio.importe = dto.importe;
      precio.user = usuario;

      const newPrecio: Precio = qR
        ? await qR.manager.save(Precio, precio)
        : await this.precioRepository.save(precio);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad,
          dato: newPrecio
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return newPrecio;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Precio, DtoPrecioEditar, typeof Entidad.PRECIO>): Promise<UpdateRetorno<Precio>> {
    try {
      const precio: Precio = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        relaciones,
        selected,
        entidadError
      });

      precio.nombre = dto.nombre || precio.nombre;
      precio.importe = dto.importe || precio.importe;

      const newPrecio: Precio = qR
        ? await qR.manager.save(Precio, precio)
        : await this.precioRepository.save(precio);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad,
          dato: newPrecio
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return { dato: newPrecio, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de precios`)
    }
  }
}
