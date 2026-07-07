import { toRespuestaBase, toRespuestaResumen } from "../../utils/toRespuesta.function";
import { DtoClienteRespuesta } from "../dto/cliente.dto";
import { DtoResumenClienteRespuesta } from "../dto/cliente_resumen.dto";
import { Cliente } from "../entity/cliente.entity";
import { ClienteRetorno } from "../interface/cliente_retorno.interface";

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

export const toRespuestaClienteXbusqueda = (dato?: ClienteRetorno): DtoClienteRespuesta | undefined => {
  if (!dato) return undefined;
  let resumen: DtoResumenClienteRespuesta | undefined;
  if (dato.pendiente != undefined && dato.listo != undefined && dato.cancelado != undefined && dato.retirado != undefined) {
    resumen = {
      pendiente: dato.pendiente,
      listo: dato.listo,
      retirado: dato.retirado,
      cancelado: dato.cancelado
    }
  }

  return {
    id: dato.id,
    nombre: dato.nombre,
    telefono: dato.telefono,
    email: dato.email,
    resumen,
    fechaActualizacion: dato.fecha_actualizacion,
    fechaCreacion: dato.fecha_creacion,
    deleted: dato.deleted
  }
}