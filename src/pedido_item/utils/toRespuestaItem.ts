import { DtoSedeRespuesta } from "../../sede/dto/sedeRetorno.dto";
import { DtoPedidoRespuesta } from "../../pedido/dto/pedido.dto";
import { toRespuestaSede } from "../../sede/utils/toRespuestaSede";
import { DtoPedidoItemRespuesta } from "../dto/pedido_item.dto";
import { PedidoItem } from "../entity/pedido_item.entity";
import { GetPedidoItemBusqueda, RetornoVistaItemsPedidoLibroById, wv_cambio_sede_prop } from "../interface/pedido_item_busqueda.interface";
import { DtoClienteRespuesta } from "../../cliente/dto/cliente.dto";
import { DtoLibroRespuesta } from "../../libro/dto/libroRetorno.dto";
import { toRespuestaPedidoCliente } from "@src/cliente/utils/toRespuestaCliente";
import { ItemRetorno } from "../retorno/item.retorno";

export const toRespuestaPedidoItem = (dato?: PedidoItem): ItemRetorno | undefined => {
  if (!dato) return undefined;
  const item = new ItemRetorno({...dato});
  if(dato.sede) item.agregarSedeItemRetorno({...dato.sede});
  if(dato.pedido) item.agregarPedidoAlItem({...dato.pedido, ...dato.pedido.cliente, id_cliente:dato.pedido.cliente.id})
  return item;
}

export const toRespuestaItemsPedidoByLibro = (dato?:RetornoVistaItemsPedidoLibroById):ItemRetorno | undefined =>{
  if(!dato) return undefined;
  const item = new ItemRetorno({...dato, idPedido:dato.id_pedido, id:dato.nro_pedido});
  item.agregarEspecificacionesItem({...dato});
  item.agregarSedeItemRetorno({id:dato.id_sede, nombre: dato.sede});
  item.agregarIdLibroItem(dato.id_libro);
  item.agregarPedidoAlItem({
    ...dato, 
    fechaEntrega:dato.fecha_entrega,
    importeTotal: dato.importe_total,
    archivos: dato.archivos,
    id: dato.id_pedido,
    estado: dato.estado_pedido
  });

  return item;
}

export const toRespuestaPedidoItemCompleto = (dato: GetPedidoItemBusqueda): ItemRetorno => {
  const item = new ItemRetorno({...dato, idPedido:dato.id_pedido, id:dato.nro_pedido});
  item.agregarEspecificacionesItem({...dato});
  item.agregarLibroItem({...dato});
  item.agregarSedeItemRetorno({id:dato.id_sede, nombre: dato.sede});
  item.agregarPedidoAlItem({
    ...dato, 
    fechaEntrega:dato.fecha_entrega,
    importeTotal: dato.importe_total,
    archivos: dato.archivs,
    id: dato.id_pedido,
    estado: dato.estado_pedido
  });

  return item;
}

export const toRespuestaCambioSedeItem = (dato?: wv_cambio_sede_prop): ItemRetorno | undefined => {
  if (!dato) return undefined;
  const item = new ItemRetorno({...dato, idPedido:dato.id_pedido});
  item.cambioSedeItem({...dato})
  return item;
}