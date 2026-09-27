import { toRespuestaBase, toRespuestaResumen } from "../../utils/toRespuesta.function";
import { DtoClienteRespuesta } from "../dto/cliente.dto";
import { Cliente } from "../entity/cliente.entity";
import { ClienteRetornoQueryProp } from "../interface/cliente_retorno.interface";
import { GetPedidoItemBusqueda } from "@src/pedido_item/interface/pedido_item_busqueda.interface";
import { ClienteRetorno } from "../retorno/cliente.retorno";

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

export const toRespuestaClienteXbusqueda = (dato?: ClienteRetornoQueryProp): ClienteRetorno | undefined => {
  if (!dato) return undefined;
  const cliente = new ClienteRetorno({ ...dato })
  if (dato.pendiente != undefined && dato.listo != undefined && dato.cancelado != undefined && dato.retirado != undefined) {
    const resumen = {
      pendiente: dato.pendiente,
      listo: dato.listo,
      retirado: dato.retirado,
      cancelado: dato.cancelado
    }
    cliente.agregarResumenCliente({ ...resumen });
  }
  return cliente;
}

export const toRespuestaPedidoCliente = (dato?: GetPedidoItemBusqueda): DtoClienteRespuesta | undefined => {
  if (!dato || !dato.id_cliente) return undefined
  const cliente: DtoClienteRespuesta = {
    id: dato.id_cliente,
    deleted: false,
    telefono: dato.telefono,
    email: dato.email
  }
  return cliente;
}
