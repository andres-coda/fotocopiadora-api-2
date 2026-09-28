import { DtoPedidoItemRespuesta } from "../../pedido_item/dto/pedido_item.dto";
import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { toRespuestaBase } from "../../utils/toRespuesta.function";
import { DtoPedidoRespuesta } from "../dto/pedido.dto";
import { Pedido } from "../entity/pedido.entity";
import { DtoClienteRespuesta } from "../../cliente/dto/cliente.dto";
import { toRespuestaCliente, toRespuestaPedidoCliente } from "../../cliente/utils/toRespuestaCliente";
import { toRespuestaPedidoItem } from "../../pedido_item/utils/toRespuestaItem";
import { fc_cambiar_estado_pedido_prop, fc_crear_pedido_prop, GetPedidoBusqueda } from "../interface/pedido.interface";
import { GetPedidoItemBusqueda } from "@src/pedido_item/interface/pedido_item_busqueda.interface";
import { PedidoRetorno } from "../retorno/pedido.retorno";

export const toRespuestaPedido = (dato?: fc_crear_pedido_prop): PedidoRetorno | undefined => {
  if (!dato) return undefined;
  const pedido = new PedidoRetorno({...dato});
  if(dato.cliente){
    pedido.agregarClienteRetorno({...dato.cliente})
  }
  if(dato.items.length > 0) {
    dato.items.map(i=> pedido.agregarItemPedido({...i}))
  }
  return pedido;
}

export const toRespuestaPedidoCambioEstado = (datos?:fc_cambiar_estado_pedido_prop[]):PedidoRetorno | undefined => {
  if(!datos || datos.length === 0) return undefined;
  const pedido = new PedidoRetorno({...datos[0]});

  pedido.agregarClienteRetorno({id: datos[0].id_cliente});
  pedido.cliente?.agregarResumenCliente({...datos[0]});

  for(const dato of datos) {
    pedido.agregarItemsCambioEstadoPedido({
      ...dato,
      pendiente:dato.libro_pendiente,
      listo: dato.libro_listo,
      retirado: dato.libro_retirado,
      cancelado: dato.libro_cancelado
    },{ id: dato.nro_pedido, estado:dato.estado, idPedido: dato.id, fecha_actualizacion: dato.fecha_actualizacion });
  }
  return pedido;
}

export const toRespuestaPedidoGetItem = (dato?: GetPedidoItemBusqueda):DtoPedidoRespuesta | undefined=> {
  if(!dato || !dato.id_pedido) return undefined;
  const cliente: DtoClienteRespuesta | undefined= toRespuestaPedidoCliente(dato);

  const pedido: DtoPedidoRespuesta = {
    id: dato.id_pedido,
    fechaCreacion: dato.fecha_creacion,
    fechaEntrega: dato.fecha_entrega,
    importeTotal: dato.importe_total,
    archivos: dato.archivs,
    anillados: dato.anillados,
    sena: dato.sena,
    items: [],
    cliente,
    estado: dato.estado_pedido,
    deleted: false
  }
  return pedido;
}
