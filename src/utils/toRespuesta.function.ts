import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto"
import { Base } from "@src/base/entity/base.entity"
import { ClienteResumen } from "@src/cliente/entity/clienteResumen.entity"
import { DtoResumenRespuesta } from "@src/libro/dto/resumen.dto"

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





