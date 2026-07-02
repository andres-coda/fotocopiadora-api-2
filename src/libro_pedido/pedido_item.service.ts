import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp } from '../base/interface/base.interface';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { PedidoItem } from './entity/pedido_item.entity';
import { DtoLibroPedidoCrear, DtoPedidoItemEditar, DtoPedidoItemRespuesta } from './dto/pedido_item.dto';
import { Libro } from '../libro/entity/libro.entity';
import { LibroService } from '../libro/libro.service';
import { PedidoService } from '../pedido/pedido.service';
import { Pedido } from '../pedido/entity/pedido.entity';
import { EspecificacionService } from '../especificacion/especificacion.service';
import { Especificacion } from '../especificacion/entity/especificacion.entity';
import { ESPECIFICACION_RELATIONS, SELECTED_ESPECIFICACION } from '../especificacion/default/relacion.default';
import { Especificaciones } from './interface/especificaciones.interface';
import { EstadoPedido } from '@src/pedido/interface/estadoPedido.enum';
import { GetPedidoItemBusqueda } from './interface/pedido_item_busqueda.interface';
import { DtoPedidoRespuesta } from '@src/pedido/dto/pedido.dto';
import { toRespuestaEspecificacion, toRespuestaPedidoItem, toRespuestaPedidoItemCompleto } from '@src/utils/toRespuesta.function';

interface CreateDatoXEntidadProp extends Omit<CreateProp<DtoLibroPedidoCrear, typeof Entidad.RESUMEN>, "entidad"> {
  pedido: Pedido
}
interface PedidoItemGeneralProp {
  qR: QueryRunner;
  nro_pedido: number;
  id_pedido: string;
}
interface EditarPedidoItem extends PedidoItemGeneralProp {
  dto: DtoPedidoItemEditar;
}

interface CambioEstado extends PedidoItemGeneralProp {
  estado: EstadoPedido;
}

@Injectable()
export class PedidoItemService {
  constructor(
    @InjectRepository(PedidoItem) private readonly libroPedidoRepository: Repository<PedidoItem>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    private readonly libroService: LibroService,
    @Inject(forwardRef(() => PedidoService))
    private readonly espService: EspecificacionService,
  ) { }

  async getDatoByIdOrFail({ id_pedido, nro_pedido, qR }: PedidoItemGeneralProp): Promise<PedidoItem> {
    try {
      const criterio: FindOneOptions = {
        relations: ['especificacon', 'sede'],
        where: {
          'id_pedido': id_pedido,
          'id': nro_pedido
        }
      }
      const pedido_item = await qR.manager.findOne(PedidoItem, criterio);
      if (!pedido_item) throw new NotFoundException(`No se encontro el item de pedido número ${nro_pedido}`);
      return pedido_item;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al buscar el pedido item del pedido id ${id_pedido} nro ${nro_pedido}`);
    }
  }

  async getPedidoItemByIdCx({ id_pedido, nro_pedido, qR }: PedidoItemGeneralProp): Promise<DtoPedidoRespuesta[]> {
    try {
      const runner = qR ?? this.dataSource.createQueryRunner();
      if (!qR) await runner.connect();

      const rows = await runner.query(
        `SELECT * FROM vw_pedidos_item WHERE id_pedido = $1 AND ($2::int IS NULL OR id = $2)`,
        [id_pedido, nro_pedido || null]
      );

      if (!qR) await runner.release();

      return rows.map((r: GetPedidoItemBusqueda) => toRespuestaPedidoItemCompleto(r));
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al buscar el pedido item del pedido id ${id_pedido} nro ${nro_pedido}`);
    }
  }

  async createItem(dto: DtoLibroPedidoCrear, qR: QueryRunner): Promise<PedidoItem> {
    try {
      // Insertamos via SQL nativo para que el serial 'id' lo genere la BD
      const [row] = await qR.query(
        `INSERT INTO pedido_item (id_pedido, id_libro, id_sede, id_empresa, cantidad, detalles, estado)
         VALUES ($1, $2, $3, current_setting('app.empresa_id', true)::uuid, $4, $5, $6)
         RETURNING id_pedido, id`,
        [
          dto.pedido_id,
          dto.libro_id,
          dto.sede_id,
          dto.cantidad,
          dto.detalles ?? null,
          EstadoPedido.PENDIENTE,
        ],
      );
      if (dto.especificaciones?.length) {
        const especficaciones: Especificacion[] = await this.espService.getDatosByNombres({
          nombres: dto.especificaciones || [],
          qR,
          relaciones: [ESPECIFICACION_RELATIONS],
          entidadError: 'pedido',
          selected: SELECTED_ESPECIFICACION
        });


        // Si vienen especificaciones, las insertamos en pedido_item_especificacion
        for (const idEsp of especficaciones) {
          await qR.query(
            `INSERT INTO pedido_item_especificacion (id_pedido, nro_item, id_especificacion)
             VALUES ($1, $2, $3)`,
            [row.id_pedido, row.id, idEsp],
          );
        }
      }

      // Recargamos el item creado con sus relaciones
      const item: PedidoItem = await this.getDatoByIdOrFail({ id_pedido: row.id_pedido, nro_pedido: row.id, qR })

      if (!item) throw new NotFoundException('No se pudo crear el item del pedido');
      return item;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al crear item del pedido');
    }
  }

  async createItemCx(dto: DtoLibroPedidoCrear, qR: QueryRunner): Promise<DtoPedidoItemRespuesta> {
    try {
      const pedido_Item: PedidoItem = await this.createItem(dto, qR);
      return this.remplaceToReturn(pedido_Item);
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al crear item del pedido');
    }
  }
  async updateDato({ dto, qR, nro_pedido, id_pedido }: EditarPedidoItem): Promise<PedidoItem> {
    try {
      const pedido_item: PedidoItem = await this.getDatoByIdOrFail({ id_pedido, nro_pedido, qR });

      const actuales: Especificaciones[] = (pedido_item.especificacion ?? [])
        .flatMap(e => {
          const esp = toRespuestaEspecificacion(e);
          return esp ? [esp] : [];
        });

      const nuevas: Especificaciones[] = dto.especificaciones || [];

      const setActual: Set<Especificaciones> = new Set(actuales);
      const setNuevo: Set<Especificaciones> = new Set(nuevas);

      const sonIguales: boolean =
        setActual.size === setNuevo.size &&
        [...setActual].every(e => setNuevo.has(e));

      const especificaciones: Especificacion[] = sonIguales
        ? pedido_item.especificacion
        : await this.espService.getDatosByNombres({
          nombres: dto.especificaciones || [],
          qR,
          relaciones: [ESPECIFICACION_RELATIONS],
          entidadError: 'pedido',
          selected: SELECTED_ESPECIFICACION
        });


      pedido_item.cantidad = dto.cantidad ?? pedido_item.cantidad;
      pedido_item.detalles = dto.detalles ?? pedido_item.detalles;
      pedido_item.libro_id = dto.libroId || pedido_item.libro_id;
      pedido_item.sede_id = dto.sedeId || pedido_item.sede_id;
      pedido_item.estado = dto.estado ?? pedido_item.estado;
      pedido_item.especificacion = especificaciones;

      const new_pedido_item: PedidoItem = qR
        ? await qR.manager.save(PedidoItem, pedido_item)
        : await this.libroPedidoRepository.save(pedido_item);

      return new_pedido_item;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar item de libro en pedidos`)
    }
  }

  async updateDatoCx({ dto, qR, nro_pedido, id_pedido }: EditarPedidoItem): Promise<DtoPedidoItemRespuesta> {
    try {
      const pedido_Item: PedidoItem = await this.updateDato({ dto, qR, nro_pedido, id_pedido });
      return this.remplaceToReturn(pedido_Item);
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

  async cambiarEstadoCx({ estado, id_pedido, nro_pedido, qR }: CambioEstado): Promise<DtoPedidoItemRespuesta> {
    try {
      const pedido_item: PedidoItem = await this.getDatoByIdOrFail({
        id_pedido,
        nro_pedido,
        qR,
      });

      if (pedido_item.estado === estado) return this.remplaceToReturn(pedido_item);

      pedido_item.estado = estado;

      const new_pedido_item: PedidoItem = qR
        ? await qR.manager.save(PedidoItem, pedido_item)
        : await this.libroPedidoRepository.save(pedido_item);

      return this.remplaceToReturn(new_pedido_item);
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar cambiar el estado del libro`)
    }
  }

  remplaceToReturn(entidad: PedidoItem): DtoPedidoItemRespuesta {
    const respuesta = toRespuestaPedidoItem(entidad);
    if (!respuesta) throw new NotFoundException(`El estado del item número ${entidad.id} del pedido ${entidad.idPedido} no se pudo adaptar`);
    return respuesta;
  }

  async deleteItem({ id_pedido, nro_pedido, qR }: PedidoItemGeneralProp): Promise<boolean> {
    try {
      const item = await qR.manager.findOne(PedidoItem, {
        where: { 'idPedido': id_pedido, 'id': nro_pedido },
      });

      if (!item) throw new NotFoundException(`No se encontró el item ${nro_pedido}`);

      await qR.manager.remove(PedidoItem, item);
      return true;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al eliminar item ${nro_pedido}`);
    }
  }
}