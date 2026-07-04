import { toRespuestaBase, toRespuestaResumen } from "../../utils/toRespuesta.function";
import { DtoClienteRespuesta } from "../dto/cliente.dto";
import { Cliente } from "../entity/cliente.entity";

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