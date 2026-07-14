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
import { GetPedidoItemBusqueda, RetornoVistaItemsPedidoLibroById } from './interface/pedido_item_busqueda.interface';
import { toRespuestaItemsPedidoByLibro, toRespuestaPedidoItem, toRespuestaPedidoItemCompleto } from './utils/toRespuestaItem';
import { GetGenericoProp, RetornoGenericoServiceGet } from '@src/interface/general.interface';

interface CreateDatoXEntidadProp extends Omit<CreateProp<DtoLibroPedidoCrear, typeof Entidad.PEDIDO>, "entidad"> {
  pedido: Pedido
}

interface PedidoItemByLibroProp{
  id_libro:string;
  qR:QueryRunner;
  limite?:number;
  offset?:number;
  id_empresa:string;
}

interface ItemsByPedidoId extends Omit<PedidoItemByLibroProp, 'id_libro'>{
  id_pedido:string;
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

interface UpdateDatoEntidadProp {
  dato: DtoPedidoItemRespuesta;
  qR: QueryRunner;
  dto: DtoPedidoItemEditar;
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

  async getItems({qR, limite = 20, offset = 0, orden}:GetGenericoProp):Promise<RetornoGenericoServiceGet<DtoPedidoItemRespuesta>> {
    try {

      const newOrden = orden ?? 'estado';
      const rows = await qR.query(
        `SELECT * FROM vw_pedidos_item ORDER BY ${newOrden} LIMIT $1 OFFSET $2`,
        [limite, offset]
      );

      const datos:DtoPedidoItemRespuesta[] = rows.map((r: GetPedidoItemBusqueda) => toRespuestaPedidoItemCompleto(r));
      return {
        total: rows[0].total,
        datos,
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al leer los items de pedidos`);
    }
  }

  async getItemByPedido({id_pedido, qR, limite = 20, offset = 0}:ItemsByPedidoId):Promise<RetornoGenericoServiceGet<DtoPedidoItemRespuesta>> {
    try {

      const rows = await qR.query(
        `SELECT *, count(*) over() AS total_local FROM vw_pedidos_item WHERE id_pedido = $1 LIMIT $2 OFFSET $3`,
        [id_pedido, limite, offset]
      );

      const datos = rows.map((r: GetPedidoItemBusqueda) => toRespuestaPedidoItemCompleto(r));
      return {
        total:rows[0].total_local ?? 0,
        datos
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al leer los items del pedido ${id_pedido}`);
    }
  }

  async getPedidoItemByIdCx({ id_pedido, nro_pedido, qR }: PedidoItemGeneralProp): Promise<DtoPedidoItemRespuesta[]> {
    try {

      const rows = await qR.query(
        `SELECT * FROM vw_pedidos_item WHERE id_pedido = $1 AND ($2::int IS NULL OR id = $2)`,
        [id_pedido, nro_pedido || null]
      );

      return rows.map((r: GetPedidoItemBusqueda) => toRespuestaPedidoItemCompleto(r));
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al buscar el pedido item del pedido id ${id_pedido} nro ${nro_pedido}`);
    }
  }

  async getItemsPedidoByLibroId({ id_libro, qR, limite = 20, offset = 0, id_empresa }: PedidoItemByLibroProp): Promise<RetornoGenericoServiceGet<DtoPedidoItemRespuesta>> {
    try {
      const rows: RetornoVistaItemsPedidoLibroById[] = await qR.query(
        'SELECT * FROM vw_pedido_libro pi where pi.id_libro = $1 ORDER BY pi.estado ASC, pi.fecha_entrega ASC LIMIT $2 OFFSET $3',
        [id_libro, limite, offset]
      )
      if (!rows) return {datos:[], total:0};

      const itemsPedido: DtoPedidoItemRespuesta[] = rows
        .map((r) => toRespuestaItemsPedidoByLibro(r))
        .filter((item): item is DtoPedidoItemRespuesta => item !== undefined);

      return {
        datos:itemsPedido,
        total: rows[0].total
      };
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar extraer los pedidos del libro ${id_libro}`);
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
        const especficaciones: Especificacion[] = await this.espService.getEspecificacionesByNombres({
          nombres: dto.especificaciones || [],
          qR,
        });


        // Si vienen especificaciones, las insertamos en pedido_item_especificacion
        for (const idEsp of especficaciones) {
          await qR.query(
            `INSERT INTO pedido_item_especificacion (id_pedido, nro_item, id_especificacion)
             VALUES ($1, $2, $3)`,
            [row.id_pedido, row.id, idEsp.id],
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

  async updateEspecificacionesPedidoItem({ dato, qR, dto }: UpdateDatoEntidadProp): Promise<DtoPedidoItemRespuesta> {
    try {
      const actuales = new Set(dato.especificaciones ?? []);
      const nuevas = new Set(dto.especificaciones ?? []);

      const aEliminar = [...actuales].filter(e => !nuevas.has(e));
      const aInsertar = [...nuevas].filter(e => !actuales.has(e));

      if (aEliminar.length === 0 && aInsertar.length === 0) return dato;

      if (aEliminar.length > 0) {
        await qR.query(
          `DELETE FROM pedido_item_especificacion pie
         USING especificacion e
         WHERE e.id = pie.id_especificacion
           AND pie.id_pedido = $1
           AND pie.nro_item  = $2
           AND e.nombre = ANY($3::varchar[])`,
          [dato.idPedido, dato.id, aEliminar],
        );
      }

      if (aInsertar.length > 0) {
        await qR.query(
          `INSERT INTO pedido_item_especificacion (id_pedido, nro_item, id_especificacion)
         SELECT $1, $2, e.id
         FROM especificacion e
         WHERE e.nombre = ANY($3::varchar[])`,
          [dato.idPedido, dato.id, aInsertar],
        );
      }

      return { ...dato, especificaciones: [...nuevas] };

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar item nro ${dato.id} del pedido ${dato.idPedido}`)
    }
  }

  async updateDato({ dto, qR, nro_pedido, id_pedido }: EditarPedidoItem): Promise<PedidoItem> {
    try {
      const pedido_items: DtoPedidoItemRespuesta[] = await this.getPedidoItemByIdCx({ id_pedido, nro_pedido, qR });
      if (pedido_items.length != 1) throw new NotFoundException(`El pedido tiene mas de un item con el mismo nro, o no se encontro el item con el nro ${nro_pedido}`);
      const pedido_item: DtoPedidoItemRespuesta = pedido_items[0];

      const cantidad = dto.cantidad ?? pedido_item.cantidad;
      const detalles = dto.detalles ?? pedido_item.detalles;
      const estado = dto.estado ?? pedido_item.estado;

      const libroId = dto.libroId ?? pedido_item.libro?.id;
      const sedeId = dto.sedeId ?? pedido_item.sede?.id;

      if (!libroId) throw new NotFoundException('Falta el libro');
      if (!sedeId) throw new NotFoundException('Falta la sede');

      await this.updateEspecificacionesPedidoItem({ dato: pedido_item, qR, dto });

      const [row] = await qR.query(
        `UPDATE pedido_item SET 
        cantidad = $1,
        detalles = $2,
        estado = $3,
        id_sede = $4,
        id_libro = $5
        WHERE id_pedido = $6
        AND id = $7
        RETURNING *`,
        [cantidad, detalles, estado, sedeId, libroId, id_pedido, nro_pedido]
      )

      return row;

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
      const libro: Libro = await this.libroService.getLibroEmpresaByIdOrdFail({ id: dto.libro_id, qR });

      const [pedido_item] = await qR.query(
        `INSERT INTO pedido_item (id_pedido, id_libro, id_sede, id_empresa, cantidad, detalles, estado)
         VALUES ($1, $2, $3, current_setting('app.empresa_id', true)::uuid, $4, $5, $6)
         RETURNING id_pedido, id`,
        [
          pedido.id,
          libro.id_libro,
          dto.sede_id,
          dto.cantidad,
          dto.detalles ?? null,
          EstadoPedido.PENDIENTE,
        ],
      );

      const especificaciones: Especificaciones[] = await this.createEspecificacionXpedido(pedido_item, qR, libro, dto.especificaciones);
      pedido_item.libro = libro;
      pedido_item.especificacion = especificaciones;

      return pedido_item;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el item del pedido en el registro de pedidos`)
    }
  }

  async createEspecificacionXpedido(pi: PedidoItem, qR: QueryRunner, libro: Libro, esp?: Especificaciones[]): Promise<Especificaciones[]> {
    try {
      const dtoEsp: Especificaciones[] = !esp || esp.length === 0
        ? libro.especificaciones_defecto ?? []
        : esp ?? [];

      if (dtoEsp.length) {
        await qR.query(
          `INSERT INTO pedido_item_especificacion (id_pedido, nro_item, id_especificacion)
         SELECT $1, $2, e.id
         FROM especificacion e
         WHERE e.nombre = ANY($3::varchar[])`,
          [pi.idPedido, pi.id, dtoEsp],
        );
      }
      return dtoEsp;
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