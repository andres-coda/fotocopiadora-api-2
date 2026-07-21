import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, ILike, Repository } from 'typeorm';
import { PrecioEmpresa } from './entity/precio_empresa.entity';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { DtoPrecioEmpresaCrear, DtoPrecioEmpresaEditar, DtoPrecioEmpresaRespuesta } from './dto/precio_empresa.dto';
import { Entidad, Mensaje } from '@src/gateway/dto/gatewayDto.dto';
import { Mens } from '@src/gateway/enum/Mens.enum';
import { PrecioService } from './precio.service';
import { Precio } from './entity/precio.entity';
import { BusquedaGenericoProp, CreateGenericoProp, GetGenericoByIdProp, GetGenericoProp, RetornoGenericoServiceGet, UpdateGenericoProp } from '@src/interface/general.interface';


@Injectable()
export class PrecioEmpresaService {
  constructor(
    @InjectRepository(PrecioEmpresa)
    private readonly precioEmpresaRepo: Repository<PrecioEmpresa>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly erroresService: ErroresService,
    private readonly gateway: GatewayGateway,
    private readonly precioService: PrecioService
  ) { }

  /**
   * Devuelve todos los precios de la empresa actual.
   * El RLS filtra automáticamente por id_empresa.
   * Hace join con precio para traer nombre y descripcion.
   */
  async getPreciosEmpresa({ qR, limite, offset }: GetGenericoProp): Promise<RetornoGenericoServiceGet<DtoPrecioEmpresaRespuesta>> {
    try {
      const criterio: FindManyOptions = {
        relations: ['precio'],
        order: { precio: { nombre: 'ASC' } },
        take: limite ?? 20,
        skip: offset ?? 0
      }

      const [datos, total] = await qR.manager.findAndCount(PrecioEmpresa, criterio);

      return {
        total,
        datos: datos.map((pe) => this.toRespuesta(pe))
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al leer precios de la empresa');
    }
  }

  async getPreciosEmpresaBusqueda({ qR, limite, offset, busqueda }: BusquedaGenericoProp): Promise<RetornoGenericoServiceGet<DtoPrecioEmpresaRespuesta>> {
    try {
      const criterio: FindManyOptions = {
        relations: ['precio'],
        where: {
          precio: {
            nombre: ILike(`%${busqueda}%`)
          }
        },
        take: limite ?? 20,
        skip: offset ?? 0
      }

      const [datos, total] = await qR.manager.findAndCount(PrecioEmpresa, criterio);

      return {
        total,
        datos: datos.map((pe) => this.toRespuesta(pe))
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al leer precios de la empresa');
    }
  }

  /**
   * Busca un precio de empresa por idPrecio.
   * RLS garantiza que solo se accede al de la empresa actual.
   */
  async getPrecioEmpresaByIdOrFail({ id, qR }: GetGenericoByIdProp): Promise<PrecioEmpresa> {
    try {
      const criterio: FindOneOptions = {
        relations: ['precio'],
        where: { id_precio: id }
      }

      const precio = await qR.manager.findOne(PrecioEmpresa, criterio);

      if (!precio) throw new NotFoundException(`No se encontró el precio ${id} para esta empresa`);

      return precio;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al leer precio ${id}`);
    }
  }

  async getPrecioEmpresaByIdOrFailCx({ id, qR }: GetGenericoByIdProp): Promise<DtoPrecioEmpresaRespuesta> {
    try {
      const precio: PrecioEmpresa = await this.getPrecioEmpresaByIdOrFail({ qR, id });

      return this.toRespuesta(precio)
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al leer precio ${id}`);
    }
  }

  /**
   * Crea un precio para la empresa actual.
   * id_empresa lo inyecta PostgreSQL via RLS / DEFAULT fc_empresa_actual().
   * Si la BD no tiene DEFAULT, obtenemos el id_empresa del GUC:
   *   SELECT current_setting('app.empresa_id')
   */
  async createPrecioEmpresa({ dto, qR }: CreateGenericoProp<DtoPrecioEmpresaCrear>): Promise<DtoPrecioEmpresaRespuesta> {
    try {

      let precio: Precio | null = await this.precioService.getDatoByName({
        id: dto.nombre,
        qR,
      });

      if (!precio) {
        precio = await this.precioService.createDato({ dto, qR });
      }

      const pe = new PrecioEmpresa();
      pe.id_precio = precio.id;
      pe.importe = dto.importe;
      pe.detalles = dto.detalles;

      const saved = await qR.manager.save(PrecioEmpresa, pe);
      const newPrecio: PrecioEmpresa = {
        ...saved,
        precio
      }

      const retorno = this.toRespuesta(newPrecio!);

      return retorno;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al crear precio de empresa');
    }
  }

  async updatePrecioEmpresa({ id, dto, qR }: UpdateGenericoProp<DtoPrecioEmpresaEditar>): Promise<DtoPrecioEmpresaRespuesta> {
    try {
      let precio: Precio | undefined;
      if (dto.nombre) {
        precio = await this.precioService.updateDato({
          dto: { nombre: dto.nombre },
          qR,
          id
        })
      }

      const pe = await this.getPrecioEmpresaByIdOrFail({ id, qR });

      if (dto.importe !== undefined) pe.importe = dto.importe;
      if (dto.detalles !== undefined) pe.detalles = dto.detalles;

      const saved = await qR.manager.save(PrecioEmpresa, pe);
      const retorno = this.toRespuesta({ ...pe, ...saved });

      /*  this.gateway.actualizacionDato({
         mensaje: Mens.EDITAR,
         entidad: Entidad.PRECIO,
         dato: retorno,
       } as Mensaje); */

      return retorno;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al editar precio ${id}`);
    }
  }

  async deletePrecioEmpresa({ id, qR }: GetGenericoByIdProp): Promise<boolean> {
    try {
      const pe = await this.getPrecioEmpresaByIdOrFail({ id, qR });

      await qR.manager.remove(PrecioEmpresa, pe);

      this.gateway.actualizacionDato({
        mensaje: Mens.ELIMINAR,
        entidad: Entidad.PRECIO,
        id: id,
      } as Mensaje);

      return true;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al eliminar precio ${id}`);
    }
  }

  private toRespuesta(pe: PrecioEmpresa): DtoPrecioEmpresaRespuesta {
    return {
      idPrecio: pe.id_precio,
      idEmpresa: pe.id_empresa,
      nombre: pe.precio?.nombre ?? '',
      abreviatura: pe.precio?.abreviatura,
      descripcion: pe.precio?.descripcion,
      fecha_actualizacion: pe.fecha_actualizacion,
      fecha_creacion: pe.fecha_creacion,
      delete: pe.deleted ?? false,
      importe: Number(pe.importe),
      detalles: pe.detalles,
    };
  }
}
