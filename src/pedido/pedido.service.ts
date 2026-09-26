import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Pedido } from './entity/pedido.entity';
import { DtoPedidoCambioEstadoRespuesta, DtoPedidoCrear, DtoPedidoEditar, DtoPedidoItemCambioEstadoPedido, DtoPedidoRespuesta, DtoPedidoRespuestaCliente } from './dto/pedido.dto';
import { DtoPedidoItemRespuesta } from '../pedido_item/dto/pedido_item.dto';
import { GetPedidoItemBusqueda } from '@src/pedido_item/interface/pedido_item_busqueda.interface';
import { toRespuestaPedido } from './utils/toRespuestaPedido';
import { toRespuestaPedidoItemCompleto } from '../pedido_item/utils/toRespuestaItem';
import { BusquedaGenericoProp, GetGenericoByIdProp, RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { EstadoPedido } from './interface/estadoPedido.enum';
import { OrdenPedidoCliente } from '@src/cliente/interface/cliente_retorno.interface';

interface BusquedaPedidoProp extends BusquedaGenericoProp {
  estado: EstadoPedido | undefined
}

interface BuscarPedidoByIdClienteProp extends Omit<BusquedaGenericoProp, 'busqueda'> {
  orden?: OrdenPedidoCliente,
  idCliente: string;
  filtroEstado?: EstadoPedido
}

interface CambioEstadoPedido extends GetGenericoByIdProp {
  estado: EstadoPedido;
}

@Injectable()
export class PedidoService extends BaseService<typeof Entidad.PEDIDO, Pedido, DtoPedidoCrear, DtoPedidoEditar> {
  constructor(
    @InjectRepository(Pedido) private readonly pedidoRepository: Repository<Pedido>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(pedidoRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDatoAuxiliar({ dto, qR, entidad }: CreateProp<DtoPedidoCrear, typeof Entidad.PEDIDO>): Promise<DtoPedidoRespuesta> {
    try {
      if (!qR) throw new NotFoundException('No se pudo crear transacción para la operación');
      if (!dto.cliente && !dto.clienteDatos) throw new NotFoundException('Requiere datos del cliente');
      const [row] = await qR.query(
        'select * from fc_crear_pedido($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb) as resultado',
        [
          dto.clienteDatos?.telefono, dto.clienteDatos?.email, dto.clienteDatos?.nombre, dto.cliente, dto.fechaEntrega, dto.importeTotal,
          dto.archivos, dto.anillados, dto.sena, JSON.stringify(dto.pedidoItems)
        ]
      );

      return row.resultado;

    } catch (er) {
      console.dir(er, { depth: null });
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.importeTotal} en el registro de ${entidad}`)
    }
  }

  async createDato({ dto, qR, entidad }: CreateProp<DtoPedidoCrear, typeof Entidad.PEDIDO>): Promise<Pedido> {
    try {
      throw new NotFoundException('Metodo no implementado');
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.importeTotal} en el registro de ${entidad}`)
    }
  }

  async updateDato({ dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Pedido, DtoPedidoEditar, typeof Entidad.PEDIDO>): Promise<UpdateRetorno<Pedido>> {
    try {
      const pedido: Pedido = await this.getDatoByIdOrFail({
        id,
        qR,
        relaciones,
        selected,
        entidadError
      });

      pedido.fechaEntrega = dto.fechaEntrega || pedido.fechaEntrega;
      pedido.importeTotal = dto.importeTotal || pedido.importeTotal;
      pedido.archivos = dto.archivos || pedido.archivos;
      pedido.anillados = dto.anillados || pedido.anillados;
      pedido.sena = dto.sena || pedido.sena;

      const newPedido: Pedido = qR
        ? await qR.manager.save(Pedido, pedido)
        : await this.pedidoRepository.save(pedido);

      return { dato: newPedido, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.importeTotal || id} en el registro de pedidos`)
    }
  }

  async createDatoCx({ dto, entidad, qR }: CreateProp<DtoPedidoCrear, "pedido">): Promise<DtoPedidoRespuesta> {
    try {
      if (!dto.pedidoItems || dto.pedidoItems.length === 0) throw new NotFoundException('No se puede crear un pedido sin sus items');

      const retorno: DtoPedidoRespuesta | undefined = await this.createDatoAuxiliar({ dto, entidad, qR });

      if (!retorno) throw new NotFoundException(`No se pudo preparar el pedido para su retorno`);

      const payload: Mensaje = {
        mensaje: Mens.CREAR,
        entidad: Entidad.PEDIDO,
        dato: retorno
      }
      this.gateway.actualizacionDato(payload);

      return retorno;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el elemento en la entidad`)
    }
  }

  remplaceToReturn(entidad: Pedido): DtoPedidoRespuesta | undefined {
    return toRespuestaPedido(entidad);
  }

  async buscarPedidos({ busqueda, limite = 20, offset = 0, qR, estado }: BusquedaPedidoProp): Promise<RetornoGenericoServiceGet<DtoPedidoItemRespuesta>> {
    try {

      const total = await qR.query(
        `SELECT count(DISTINCT nro_pedido) as total  FROM fc_buscar_pedido($1, $2, 0,0)`,
        [busqueda, estado],
      );

      const rows = await qR.query(
        `SELECT * FROM fc_buscar_pedido($1, $2, $3, $4)`,
        [busqueda, estado, Number(limite), offset],
      );

      return {
        total,
        datos: rows.map((r: GetPedidoItemBusqueda) => toRespuestaPedidoItemCompleto(r))
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al buscar pedidos');
    }
  }


  async buscarPedidosByCliente({ orden = OrdenPedidoCliente.ESTADO_PEDIDO, limite = 20, offset = 0, qR, idCliente, filtroEstado }: BuscarPedidoByIdClienteProp): Promise<RetornoGenericoServiceGet<DtoPedidoRespuestaCliente>> {
    try {
      const criterio: FindManyOptions = this.crearCriterio({
        where: {
          idCliente: idCliente,
          ...(filtroEstado ? { estado: filtroEstado } : {})
        },
        orden: orden as keyof Pedido,
        limite,
        offset
      });


      const [datos, total] = qR
        ? await qR.manager.findAndCount(Pedido, criterio)
        : await this.baseRepository.findAndCount(criterio);


      return { total, datos }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al buscar los pedidos del cliente ${idCliente}`);
    }
  }

  async cambiarEstadoPedidoCx({ estado, qR, id }: CambioEstadoPedido): Promise<DtoPedidoCambioEstadoRespuesta> {
    try {
      const rows = await qR.query(
        `SELECT * FROM fc_cambiar_estado_pedido($1, $2)`,
        [estado, id],
      );

      if (!rows || rows.length === 0) throw new NotFoundException(`No se pudo actualizar el estado del pedido ${id}`);

      const items: DtoPedidoItemCambioEstadoPedido[] = [];
      for (const r of rows) {
        const item: DtoPedidoItemCambioEstadoPedido = {
          libro: {
            id: r.id_libro,
            stock: {
              pendiente: r.libro_pendiente,
              listo: r.libro_listo,
              retirado: r.libro_retirado,
              cancelado: r.libro_cancelado
            }
          },
          fechaActualizacion: r.fecha_actualizacion,
          estado: r.estado,
          id: r.nro_pedido,
          idPedido: r.id
        }
        items.push(item);
      }

      const pedido: DtoPedidoCambioEstadoRespuesta = {
        id: rows[0].id,
        estado: rows[0].estado,
        fechaActualizacion: rows[0].fecha_actualizacion,
        cliente: {
          id: rows[0].id_cliente,
          resumen: {
            pendiente: rows[0].pendiente,
            listo: rows[0].listo,
            retirado: rows[0].retirado,
            cancelado: rows[0].cancelado
          }
        },
        items: items
      }

      return pedido;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al cambiar estado del pedido ${id}`);
    }
  }

}
