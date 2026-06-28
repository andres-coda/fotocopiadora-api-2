import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarElementoControllerProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { PedidoItem } from './entity/pedido_item.entity';
import { DtoLibroPedidoCrear } from './dto/pedido_item.dto';
import { LIBRO_PEDIDO_ESTADO_RELATIONS, SELECTED_LIBRO_PEDIDO_ESTADO } from './default/relacion.default';
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
import { Stock } from '../stock/entity/stock.entity';
import { StockService } from '../stock/stock.service';
import { DtoStockEditar } from '../stock/dto/stockEditar.dto';
import { STOCK_RELATIONS, STOCK_SELECTED } from '../stock/default/relacion';
import { Sede } from '../sede/entity/sede.entity';
import { SedeService } from '../sede/sede.service';
import { Estado } from '../interface/estado.interface';
import { DtoBaseRetorno } from '../base/dto/baseRetorno.dto';
import { DtoSedeRespuesta } from '../sede/dto/sedeRetorno.dto';
import { DtoLibroRespuesta } from '../libro/dto/libroRetorno.dto';
import { DtoEspecificaionRetorno } from '../especificacion/dto/DtoEspecificacionRetorno.dto';
import { EstadoPedido } from '@src/pedido/interface/estadoPedido.enum';
import { GetPedidoItemBusqueda } from './interface/pedido_item_busqueda.interface';

interface CreateDatoXEntidadProp extends Omit<CreateProp<DtoLibroPedidoCrear, typeof Entidad.RESUMEN>, "entidad"> {
  pedido: Pedido
}

@Injectable()
export class LibroPedidoService {
  constructor(
    @InjectRepository(PedidoItem) private readonly libroPedidoRepository: Repository<PedidoItem>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    private readonly libroService: LibroService,
    @Inject(forwardRef(() => PedidoService))
    private readonly pedidoService: PedidoService,
    private readonly espService: EspecificacionService,
    private readonly stockService: StockService,
    private readonly sedeService: SedeService,
  ) { }

  async getPedidoItemById(
    id_pedido: string,
    nro_item: number,
    qR?: QueryRunner,
  ): Promise<DtoPedidoRespuesta[]> {
    try {
      const runner = qR ?? this.dataSource.createQueryRunner();
      if (!qR) await runner.connect();

      const rows = await runner.query(
        `SELECT * FROM vw_pedidos_item where id_pedido = ${id_pedido} ${nro_item ? `and nro_pedido = ${nro_item}`:''}`,
      );

      if (!qR) await runner.release();

      return rows.map((r: GetPedidoItemBusqueda) => this.toRespuestaBusqueda(r));
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al buscar el pedido item del pedido id ${id_pedido} nro ${nro_item}`);
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<PedidoItem, DtoLibroPedidoEditar, typeof Entidad.LIBRO_PEDIDO>): Promise<UpdateRetorno<PedidoItem>> {
    try {
      const libroPedido: PedidoItem = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        relaciones,
        selected,
        entidadError
      });

      const libro: Libro = dto.libro_id && dto.libro_id != libroPedido.libro.id
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

      const newLibroPedido: PedidoItem = qR
        ? await qR.manager.save(PedidoItem, libroPedido)
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

  async createDatoXEntidad({ dto, qR, pedido }: CreateDatoXEntidadProp): Promise<PedidoItem> {
    try {
      if (!qR) throw new NotFoundException('Para crear un item de pedido debe iniciar una transacción');
      const libro: Libro = await this.libroService.getDatoByIdOrFail({ id: dto.libro_id, qR, entidadError: 'libro' });

      const [pedido_item] = await qR.query(
        `INSERT INTO pedido_item (id_pedido, id_libro, id_sede, id_empresa, cantidad, detalles, estado)
         VALUES ($1, $2, $3, current_setting('app.empresa_id', true)::uuid, $4, $5, $6)
         RETURNING id_pedido, id`,
        [
          pedido.id,
          libro.id,
          dto.sede_id,
          dto.cantidad,
          dto.detalles ?? null,
          EstadoPedido.PENDIENTE,
        ],
      );

      const especificaciones: Especificacion[] = await this.createEspecificacionXpedido(pedido_item, qR, libro, dto.especificaciones);
      pedido_item.libro = libro;
      pedido_item.especificacion = especificaciones;

      return pedido_item;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el item del pedido en el registro de pedidos`)
    }
  }

  async createEspecificacionXpedido(pi: PedidoItem, qR: QueryRunner, libro: Libro, esp?: Especificaciones[]): Promise<Especificacion[]> {
    try {
      const dtoEsp: Especificaciones[] = !esp || esp.length === 0
        ? libro.especificacionesDefecto || []
        : esp;

      let especificaciones: Especificacion[] = [];
      if (dtoEsp.length) {
        especificaciones = await this.espService.getDatosByNombres({
          nombres: dtoEsp,
          qR,
          relaciones: [ESPECIFICACION_RELATIONS],
          entidadError: 'especificación',
          selected: SELECTED_ESPECIFICACION
        });
        for (const idEsp of especificaciones) {
          await qR.query(
            `INSERT INTO pedido_item_especificacion (id_pedido, nro_item, id_especificacion)
             VALUES ($1, $2, $3)`,
            [pi.idPedido, pi.id, idEsp.id],
          );
        }
      }
      return especificaciones;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar agregar las especificaciones al pedido_item id: ${pi.id}`);
    }
  }

  async cambiarEstadoCx({ dto, id, entidadError, relaciones, selected, entidad }: EditarElementoControllerProp<PedidoItem, DtoCambiarEstado, typeof Entidad.LIBRO_PEDIDO>): Promise<DtoCambioEstadoLibroPedidoRespuesta> {
    try {
      const libroPedido: PedidoItem = await this.getDatoByIdOrFail({
        id,
        qR,
        relaciones: [LIBRO_PEDIDO_ESTADO_RELATIONS],
        selected: SELECTED_LIBRO_PEDIDO_ESTADO,
        entidadError
      });

      if (libroPedido.estado === dto.estado) return this.remplaceToCambioEstadoReturn(libroPedido, undefined, undefined, undefined);

      libroPedido.estado = dto.estado;
      const newLibroPedido: PedidoItem = qR
        ? await qR.manager.save(PedidoItem, libroPedido)
        : await this.libroPedidoRepository.save(libroPedido);

      const stock: Stock = await this.stockService.getDatoByIdOrFail({
        usuarioId: usuario.id,
        qR,
        id: newLibroPedido.libro.stock.id,
        entidadError: 'stock',
        relaciones: [STOCK_RELATIONS],
        selected: STOCK_SELECTED,
      });

      const pedido: Pedido = await this.pedidoService.getDatoByIdOrFail({
        usuarioId: usuario.id,
        qR,
        id: newLibroPedido.pedidoId,
        entidadError: 'pedido',
        relaciones: [PEDIDO_RELATIONS],
        selected: PEDIDO_SELECTED,
      });

      let resumen: ClienteResumen | undefined = undefined;
      let cambioPedido: boolean = false;
      if (libroPedido.pedido.estado != pedido.estado) {
        cambioPedido = true;
        resumen = await this.resumenService.getDatoByIdOrFail({
          usuarioId: usuario.id,
          qR,
          id: pedido.cliente.resumen.id,
          entidadError: 'pedido',
        });
      }

      await qR.commitTransaction();

      const retorno: DtoLibroPedidoRespuesta = this.remplaceToCambioEstadoReturn(
        newLibroPedido, stock, cambioPedido ? pedido : undefined, resumen
      );

      const payload: Mensaje = {
        mensaje: Mens.CAMBIO_ESTADO,
        entidad,
        dato: retorno
      }

      this.gatewayGateway.actualizacionDato(payload);

      return retorno;
    } catch (er) {
      await qR.rollbackTransaction();
      throw this.erroresService.handleExceptions(er, `Error al intentar cambiar el estado del libro`)
    } finally {
      await qR.release();
    }
  }

  remplaceToReturn(entidad: PedidoItem): DtoLibroPedidoRespuesta {
    const base: DtoBaseRetorno = this.remplaceToBase(entidad);
    const especificaciones: DtoEspecificaionRetorno[] = entidad.especificaciones?.length > 0
      ? entidad.especificaciones.map(esp => this.espService.remplaceToReturn(esp))
      : [];

    const libro: DtoLibroRespuesta | undefined = entidad.libro
      ? this.libroService.remplaceToReturn(entidad.libro)
      : undefined;

    const sede: DtoSedeRespuesta | undefined = entidad.sede
      ? this.sedeService.remplaceToReturn(entidad.sede)
      : undefined;

    return {
      ...base,

      cantidad: entidad.cantidad,
      detalles: entidad.detalles,
      estado: entidad.estado,

      libro,
      sede,
      especificaciones
    }
  }

  remplaceToCambioEstadoReturn(entidad: PedidoItem, stock: Stock | undefined, pedido: Pedido | undefined, resumen: ClienteResumen | undefined): DtoCambioEstadoLibroPedidoRespuesta {
    const base: DtoBaseRetorno = this.remplaceToBase(entidad);
    return {
      ...base,
      estado: entidad.estado,
      stock: stock ? this.stockService.remplaceToReturn(stock) : undefined,
      pedido: pedido ? this.pedidoService.remplaceToEstadoReturn(pedido) : undefined,
      resumen: resumen ? this.resumenService.remplaceToReturn(resumen) : undefined,
    }
  }

}