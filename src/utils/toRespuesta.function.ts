import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto"
import { Base } from "@src/base/entity/base.entity"
import { DtoClienteRespuesta } from "@src/cliente/dto/cliente.dto"
import { Cliente } from "@src/cliente/entity/cliente.entity"
import { ClienteResumen } from "@src/cliente/entity/clienteResumen.entity"
import { Especificacion } from "@src/especificacion/entity/especificacion.entity"
import { DtoLibroRespuesta } from "@src/libro/dto/libroRetorno.dto"
import { DtoResumenRespuesta } from "@src/libro/dto/resumen.dto"
import { DtoPedidoItemRespuesta } from "@src/libro_pedido/dto/pedido_item.dto"
import { PedidoItem } from "@src/libro_pedido/entity/pedido_item.entity"
import { Especificaciones } from "@src/libro_pedido/interface/especificaciones.interface"
import { GetPedidoItemBusqueda } from "@src/libro_pedido/interface/pedido_item_busqueda.interface"
import { DtoPedidoRespuesta } from "@src/pedido/dto/pedido.dto"
import { Pedido } from "@src/pedido/entity/pedido.entity"
import { DtoSedeRespuesta } from "@src/sede/dto/sedeRetorno.dto"
import { Sede } from "@src/sede/entity/sede.entity"
import { Stock } from "@src/stock/entity/stock.entity"

type tipoResumen = ClienteResumen | Stock;

export function toRespuestaBase<T extends Base | undefined>(dato: T): DtoBaseRetorno | undefined {
  if (!dato) return undefined;
  return {
    id: dato.id,
    fechaCreacion: dato.fechaCreacion,
    fechaActualizacion: dato.fechaActualizacion,
    deleted: dato.deleted ?? false,
  }
}

export const toRespuestaResumen = (dato?: tipoResumen): DtoResumenRespuesta | undefined => {
  if (!dato) return undefined;
  return {
    listo: dato.listo,
    pendiente: dato.pendiente,
    cancelado: dato.cancelado,
    retirado: dato.retirado
  }
}

export const toRespuestaCliente = (dato?: Cliente): DtoClienteRespuesta | undefined => {
  if (!dato) return undefined;
  const base = toRespuestaBase<Cliente | undefined>(dato);
  if (!base) return undefined;
  const resumen = toRespuestaResumen(dato?.resumen);
  return {
    ...base,
    nombre: dato.nombre,
    telefono: dato.telefono,
    email: dato.email,
    resumen
  }
}

export const toRespuestaPedido = (dato?: Pedido): DtoPedidoRespuesta | undefined => {
  if (!dato) return undefined;
  const base: DtoBaseRetorno | undefined = toRespuestaBase<Pedido | undefined>(dato);
  if (!base) return undefined;
  const pedidoItems: DtoPedidoItemRespuesta[] = (dato.pedidoItems ?? [])
    .flatMap(e => {
      const esp = toRespuestaPedidoItem(e);
      return esp ? [esp] : [];
    });

  const cliente: DtoClienteRespuesta | undefined = toRespuestaCliente(dato.cliente);

  return {
    ...base,
    fechaEntrega: dato.fechaEntrega,
    importeTotal: dato.importeTotal,
    archivos: dato.archivos,
    anillados: dato.anillados,
    sena: dato.sena,
    estado: dato.estado,
    cliente,
    items: pedidoItems,
  }
}

export const toRespuestaSede = (dato?: Sede): DtoSedeRespuesta | undefined => {
  if (!dato) return undefined;
  const base = toRespuestaBase<Sede>(dato);
  if (!base) return undefined

  return {
    ...base,
    nombre: dato.nombre
  }
}

export const toRespuestaEspecificacion = (dato?: Especificacion): Especificaciones | undefined => {
  if (!dato) return undefined;
  return dato.nombre;
}

export const toRespuestaPedidoItem = (dato?: PedidoItem): DtoPedidoItemRespuesta | undefined => {
  if (!dato) return undefined;
  const sede = toRespuestaSede(dato.sede);
  
  return {
    idPedido: dato?.idPedido,
    id: dato.id,
    cantidad: dato.cantidad,
    detalles: dato.detalles,
    estado: dato.estado,
    idLibro: dato.libro_id ?? dato.libro_id,
    idSede: sede?.id ?? undefined,
    sede
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
    fechaEntrega: dato.fecha_entrega.toISOString().split('T')[0],
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


