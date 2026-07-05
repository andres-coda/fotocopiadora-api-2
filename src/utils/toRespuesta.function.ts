import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto"
import { Base } from "@src/base/entity/base.entity"
import { DtoClienteRespuesta } from "@src/cliente/dto/cliente.dto"
import { Cliente } from "@src/cliente/entity/cliente.entity"
import { ClienteResumen } from "@src/cliente/entity/clienteResumen.entity"
import { Especificacion } from "@src/especificacion/entity/especificacion.entity"
import { DtoResumenRespuesta } from "@src/libro/dto/resumen.dto"
import { DtoPedidoItemRespuesta } from "@src/pedido_item/dto/pedido_item.dto"
import { Especificaciones } from "@src/pedido_item/interface/especificaciones.interface"
import { DtoPedidoRespuesta } from "@src/pedido/dto/pedido.dto"
import { Pedido } from "@src/pedido/entity/pedido.entity"
import { Stock } from "@src/libro/entity/stock.entity"

type tipoResumen = ClienteResumen;

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





