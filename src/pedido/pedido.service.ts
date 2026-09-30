import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Pedido } from './entity/pedido.entity';
import { DtoPedidoCambioEstadoRespuesta, DtoPedidoCrear, DtoPedidoEditar, DtoPedidoItemCambioEstadoPedido } from './dto/pedido.dto';
import { DtoPedidoItemRespuesta } from '../pedido_item/dto/pedido_item.dto';
import { GetPedidoItemBusqueda } from '@src/pedido_item/interface/pedido_item_busqueda.interface';
import { toRespuestaPedido, toRespuestaPedidoCambioEstado } from './utils/toRespuestaPedido';
import { toRespuestaPedidoItemCompleto } from '../pedido_item/utils/toRespuestaItem';
import { BusquedaGenericoProp, GetGenericoByIdProp, RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { EstadoPedido } from './interface/estadoPedido.enum';
import { OrdenPedidoCliente } from '@src/cliente/interface/cliente_retorno.interface';
import { fc_cambiar_estado_pedido_prop, fc_crear_pedido_prop } from './interface/pedido.interface';
import { PedidoRetorno } from './retorno/pedido.retorno';
import { ItemRetorno } from '@src/pedido_item/retorno/item.retorno';

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

  async createDatoAuxiliar({ dto, qR, entidad }: CreateProp<DtoPedidoCrear, typeof Entidad.PEDIDO>): Promise<fc_crear_pedido_prop> {
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

  async createDatoCx({ dto, entidad, qR }: CreateProp<DtoPedidoCrear, "pedido">): Promise<PedidoRetorno> {
    try {
      if (!dto.pedidoItems || dto.pedidoItems.length === 0) throw new NotFoundException('No se puede crear un pedido sin sus items');

      const retorno: fc_crear_pedido_prop | undefined = await this.createDatoAuxiliar({ dto, entidad, qR });

      const pedido: PedidoRetorno | undefined = toRespuestaPedido(retorno);

      if (!pedido) throw new NotFoundException(`No se pudo preparar el pedido para su retorno`);

      const payload: Mensaje = {
        mensaje: Mens.CREAR,
        entidad: Entidad.PEDIDO,
        dato: pedido
      }
      this.gateway.actualizacionDato(payload);

      return pedido;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el elemento en la entidad`)
    }
  }

  remplaceToReturn(entidad: Pedido): PedidoRetorno | undefined {
    if (!entidad) return undefined;
    const pedido = new PedidoRetorno({ ...entidad });
    pedido.agregarDatosPedido({ ...entidad });
    if (entidad.cliente) {
      pedido.agregarClienteRetorno({ ...entidad.cliente })
    }
    if (entidad.pedidoItems && entidad.pedidoItems.length > 0) {
      entidad.pedidoItems.map(i => pedido.agregarItemPedido({ ...i }))
    }
    return pedido;
  }

  async buscarPedidos({ busqueda, limite = 20, offset = 0, qR, estado }: BusquedaPedidoProp): Promise<RetornoGenericoServiceGet<ItemRetorno>> {
    try {

      const [total] = await qR.query(
        `SELECT count(DISTINCT nro_pedido) as total  FROM fc_buscar_pedido($1, $2, 0,0)`,
        [busqueda, estado],
      );

      const rows = await qR.query(
        `SELECT * FROM fc_buscar_pedido($1, $2, $3, $4)`,
        [busqueda, estado, Number(limite), offset],
      );

      return {
        total: total.total,
        datos: rows.map((r: GetPedidoItemBusqueda) => toRespuestaPedidoItemCompleto(r))
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al buscar pedidos');
    }
  }


  async buscarPedidosByCliente({ orden = OrdenPedidoCliente.ESTADO_PEDIDO, limite = 20, offset = 0, qR, idCliente, filtroEstado }: BuscarPedidoByIdClienteProp): Promise<RetornoGenericoServiceGet<PedidoRetorno>> {
    try {
      const criterio: FindManyOptions<Pedido> = this.crearCriterio({
        where: {
          idCliente: idCliente,
          ...(filtroEstado ? { estado: filtroEstado } : {})
        },
        orden: orden as keyof Pedido,
        limite,
        offset
      });


      const [pedidos, total] = qR
        ? await qR.manager.findAndCount(Pedido, criterio)
        : await this.baseRepository.findAndCount(criterio);

      if (pedidos.length > 0) {
        return {
          total,
          datos: pedidos.flatMap(p => {
            const pedidoAux = this.remplaceToReturn(p);
            if (pedidoAux) return [pedidoAux];
            return [];
          })
        }
      }

      return{
        total, datos:[]
      }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al buscar los pedidos del cliente ${idCliente}`);
    }
  }

  async cambiarEstadoPedidoCx({ estado, qR, id }: CambioEstadoPedido): Promise<PedidoRetorno> {
    try {
      const rows:fc_cambiar_estado_pedido_prop[] | undefined = await qR.query(
        `SELECT * FROM fc_cambiar_estado_pedido($1, $2)`,
        [estado, id],
      );

      const pedido:PedidoRetorno | undefined= toRespuestaPedidoCambioEstado(rows)
      
      if (!pedido) throw new NotFoundException(`No se pudo actualizar el estado del pedido ${id}`);
      
      return pedido;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al cambiar estado del pedido ${id}`);
    }
  }
}
