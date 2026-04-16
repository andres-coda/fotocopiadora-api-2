import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarElementoControllerProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { LibroPedido } from './entity/libroPedido.entity';
import { DtoLibroPedidoCrear } from './dto/DtoCrearLibroPedido.dto';
import { DtoLibroPedidoEditar } from './dto/DtoEditarLibroPedido.dto';
import { LIBRO_PEDIDO_ESTADO_RELATIONS, LIBRO_PEDIDO_RELATIONS, SELECTED_LIBRO_PEDIDO, SELECTED_LIBRO_PEDIDO_ESTADO } from './default/relacion.default';
import { Libro } from '../libro/entity/libro.entity';
import { LibroService } from '../libro/libro.service';
import { LIBRO_RELATIONS, SELECTED_LIBRO } from '../libro/default/relacion.default';
import { PedidoService } from '../pedido/pedido.service';
import { PEDIDO_RELATIONS, PEDIDO_SELECTED } from '../pedido/default/relacion';
import { Pedido } from '../pedido/entity/pedido.entity';
import { EspecificacionService } from '../especificacion/especificacion.service';
import { Especificacion } from '../especificacion/entity/especificacion.entity';
import { ESPECIFICACION_RELATIONS, SELECTED_ESPECIFICACION } from '../especificacion/default/relacion.default';
import { Especificaciones } from './interface/especificaciones.interface';
import { DtoCambiarEstado } from './dto/DtoCambiarEstado.dto';
import { Stock } from '../stock/entity/stock.entity';
import { StockService } from '../stock/stock.service';
import { DtoStockEditar } from '../stock/dto/stockEditar.dto';
import { STOCK_RELATIONS, STOCK_SELECTED } from '../stock/default/relacion';
import { Sede } from '../sede/entity/sede.entity';
import { SedeService } from '../sede/sede.service';

@Injectable()
export class LibroPedidoService extends BaseService<typeof Entidad.LIBRO_PEDIDO, LibroPedido, DtoLibroPedidoCrear, DtoLibroPedidoEditar> {
  constructor(
    @InjectRepository(LibroPedido) private readonly libroPedidoRepository: Repository<LibroPedido>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    private readonly libroService: LibroService,
    private readonly pedidoService: PedidoService,
    private readonly espService: EspecificacionService,
    private readonly stockService: StockService,
    private readonly sedeService: SedeService,
  ) {
    super(libroPedidoRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ usuario, dto, qR, entidad }: CreateProp<DtoLibroPedidoCrear, typeof Entidad.LIBRO_PEDIDO>): Promise<LibroPedido> {
    try {

      const libro: Libro = await this.libroService.getDatoByIdOrFail({
        id: dto.libro_id,
        qR,
        relaciones: [LIBRO_RELATIONS],
        entidadError: 'libro',
        usuarioId: usuario.id,
        selected: SELECTED_LIBRO
      });

      const pedido: Pedido = await this.pedidoService.getDatoByIdOrFail({
        id: dto.pedido_id,
        qR,
        relaciones: [PEDIDO_RELATIONS],
        entidadError: 'pedido',
        usuarioId: usuario.id,
        selected: PEDIDO_SELECTED
      });

      const sede: Sede = await this.sedeService.getDatoByIdOrFail({
        id: dto.sede_id,
        qR,
        entidadError: 'sede',
        usuarioId: usuario.id,
      });

      const especificaciones: Especificacion[] = await this.espService.getDatosByNombres({
        nombres: dto.especificaciones || [],
        qR,
        relaciones: [ESPECIFICACION_RELATIONS],
        entidadError: 'pedido',
        usuarioId: usuario.id,
        selected: SELECTED_ESPECIFICACION
      });

      const libroPedido: LibroPedido = new LibroPedido();
      libroPedido.cantidad = dto.cantidad || 0;
      libroPedido.detalles = dto.detalles;
      libroPedido.libro = libro;
      libroPedido.pedido = pedido;
      libroPedido.sede = sede;
      if (especificaciones) libroPedido.especificaciones = especificaciones;
      libroPedido.user = usuario;

      const newLibroPedido: LibroPedido = qR
        ? await qR.manager.save(LibroPedido, libroPedido)
        : await this.libroPedidoRepository.save(libroPedido);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad: entidad,
          dato: newLibroPedido
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return newLibroPedido;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el item del pedido en el registro de ${entidad}`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<LibroPedido, DtoLibroPedidoEditar, typeof Entidad.LIBRO_PEDIDO>): Promise<UpdateRetorno<LibroPedido>> {
    try {
      const libroPedido: LibroPedido = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        relaciones,
        selected,
        entidadError
      });

      const libro: Libro = dto.libro_id != libroPedido.libro.id
        ? await this.libroService.getDatoByIdOrFail({
          id: dto.libro_id,
          qR,
          relaciones: [LIBRO_RELATIONS],
          entidadError: 'libro',
          usuarioId: usuarioId,
          selected: SELECTED_LIBRO
        })
        : libroPedido.libro;

      const actuales: Especificaciones[] = libroPedido.especificaciones?.map(e => e.nombre) || [];
      const nuevas: Especificaciones[] = dto.especificaciones || [];

      const setActual: Set<Especificaciones> = new Set(actuales);
      const setNuevo: Set<Especificaciones> = new Set(nuevas);

      const sonIguales: boolean =
        setActual.size === setNuevo.size &&
        [...setActual].every(e => setNuevo.has(e));

      const especificaciones: Especificacion[] = sonIguales
        ? libroPedido.especificaciones
        : await this.espService.getDatosByNombres({
          nombres: dto.especificaciones || [],
          qR,
          relaciones: [ESPECIFICACION_RELATIONS],
          entidadError: 'pedido',
          usuarioId: usuarioId,
          selected: SELECTED_ESPECIFICACION
        });

      const sede: Sede = !dto.sede_id || libroPedido.sede.id === dto.sede_id
        ? libroPedido.sede
        : await this.sedeService.getDatoByIdOrFail({
          id: dto.sede_id,
          qR,
          entidadError: 'sede',
          usuarioId,
        });

      libroPedido.cantidad = dto.cantidad ?? libroPedido.cantidad;
      libroPedido.detalles = dto.detalles ?? libroPedido.detalles;
      libroPedido.libro = libro;
      libroPedido.sede = sede;
      libroPedido.estado = dto.estado ?? libroPedido.estado;
      libroPedido.especificaciones = especificaciones;

      const newLibroPedido: LibroPedido = qR
        ? await qR.manager.save(LibroPedido, libroPedido)
        : await this.libroPedidoRepository.save(libroPedido);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad: entidad,
          dato: newLibroPedido
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return { dato: newLibroPedido, isQr: true };

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar item de libro en pedidos`)
    }
  }

  async cambiarEstadoCx({ usuario, dto, id, entidadError, relaciones, selected, entidad }: EditarElementoControllerProp<LibroPedido, DtoCambiarEstado, typeof Entidad.LIBRO_PEDIDO>): Promise<LibroPedido> {
    const qR: QueryRunner = this.dataSource.createQueryRunner();
    await qR.connect();
    await qR.startTransaction();
    try {
      const libroPedido: LibroPedido = await this.getDatoByIdOrFail({
        id,
        usuarioId: usuario.id,
        qR,
        relaciones: [LIBRO_PEDIDO_ESTADO_RELATIONS],
        selected: SELECTED_LIBRO_PEDIDO_ESTADO,
        entidadError
      });

      if (libroPedido.estado === dto.estado) return libroPedido;

      const dtoStock: DtoStockEditar = {
        anterior: libroPedido.estado,
        actual: dto.estado,
        cantidad: libroPedido.cantidad
      }

      const stock: UpdateRetorno<Stock> = await this.stockService.updateDato({
        usuarioId: usuario.id,
        dto: dtoStock,
        qR,
        id: libroPedido.libro.stock.id,
        entidadError: 'stock',
        relaciones: [STOCK_RELATIONS],
        selected: STOCK_SELECTED,
        entidad: Entidad.STOCK
      });

      libroPedido.estado = dto.estado;
      const newLibroPedido: LibroPedido = qR
        ? await qR.manager.save(LibroPedido, libroPedido)
        : await this.libroPedidoRepository.save(libroPedido);

      await qR.commitTransaction();

      const payload: Mensaje = {
        mensaje: Mens.EDITAR,
        entidad,
        dato: newLibroPedido
      }

      this.gatewayGateway.actualizacionDato(payload);

      if (stock.isQr) {
        const payloadStock: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad: Entidad.STOCK,
          dato: stock.dato
        }
        this.gatewayGateway.actualizacionDato(payloadStock);
      }


      return newLibroPedido;
    } catch (er) {
      await qR.rollbackTransaction();
      throw this.erroresService.handleExceptions(er, `Error al intentar cambiar el estado del libro`)
    } finally {
      await qR.release();
    }
  }

}
