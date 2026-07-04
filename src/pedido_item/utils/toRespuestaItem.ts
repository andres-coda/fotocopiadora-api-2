import { DtoSedeRespuesta } from "../../sede/dto/sedeRetorno.dto";
import { DtoPedidoRespuesta } from "../../pedido/dto/pedido.dto";
import { toRespuestaSede } from "../../sede/utils/toRespuestaSede";
import { DtoPedidoItemRespuesta } from "../dto/pedido_item.dto";
import { PedidoItem } from "../entity/pedido_item.entity";
import { GetPedidoItemBusqueda, RetornoVistaItemsPedidoLibroById } from "../interface/pedido_item_busqueda.interface";
import { DtoClienteRespuesta } from "../../cliente/dto/cliente.dto";
import { DtoLibroRespuesta } from "../../libro/dto/libroRetorno.dto";

export const toRespuestaPedidoItem = (dato?: PedidoItem): DtoPedidoItemRespuesta | undefined => {
  if (!dato) return undefined;
  const sede = toRespuestaSede(dato.sede);
  
  return {
    idPedido: dato?.idPedido,
    id: dato.id,
    cantidad: dato.cantidad,
    detalles: dato.detalles,
    estado: dato.estado,
    idLibro: dato.libro_id,
    idSede: sede?.id ?? undefined,
    sede
  }
}

export const toRespuestaItemsPedidoByLibro = (dato?:RetornoVistaItemsPedidoLibroById):DtoPedidoItemRespuesta | undefined =>{
  if(!dato) return undefined;
  const pedido:DtoPedidoRespuesta = {
    id: dato.id_pedido,
    estado: dato.estado_pedido,
    fechaEntrega: dato.fecha_entrega,
    importeTotal: dato.importe_total,
    archivos: dato.archivos,
    anillados: dato.anillados,
    sena: dato.sena,
    items: []
  }
  const sede: DtoSedeRespuesta = {
    id: dato.id_sede,
    nombre:dato.sede
  }

  return{
    idPedido: dato.id_pedido,
    id: dato.nro_pedido,
    cantidad: dato.cantidad,
    detalles: dato.detalles,
    estado:dato.estado,
    idLibro: dato.id_libro,
    pedido,
    sede,
    especificaciones:dato.especificaciones
  }
}

export const toRespuestaPedidoItemCompleto = (dato?: GetPedidoItemBusqueda): DtoPedidoItemRespuesta | undefined => {
  if(!dato) return undefined;

  const cliente: DtoClienteRespuesta = {
    id: dato.id_cliente,
    deleted: false,
    telefono: dato.telefono,
    email: dato.email
  }

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
  const libro: DtoLibroRespuesta = {
    id: dato.id_libro,
    deleted: false,
    nombre: dato.nombre,
    descripcion: dato.descripcion,
    editorial: dato.editorial,
    edicion: dato.edicion,
    nivel: dato.nivel,
    cantidadPg: dato.cantidad_pg,
    anio: dato.anio,
    adhesivos: dato.cantidad_adhesivos,
    componentes_texto: dato.componentes,
    resumen: {
      listo: dato.listo,
      pendiente: dato.pendiente,
      cancelado: dato.cancelado,
      retirado: dato.retirado
    },
    materia: {
      nombre: dato.materia,
      deleted: false,
      id: dato.id_materia
    }
  }

  return {
    id: dato.nro_pedido,
    idPedido: dato.id_pedido,
    cantidad: dato.nro_pedido,
    detalles: dato.detalles,
    estado: dato.estado,
    especificaciones: dato.especficaciones ?? [],
    pedido,
    idLibro: dato.id_libro,
    libro,
    sede: {
      id: dato.id_sede,
      nombre: dato.sede,
      deleted: false
    }
  }

}


