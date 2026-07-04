import { toRespuestaBase } from "@src/utils/toRespuesta.function";
import { DtoSedeRespuesta } from "../dto/sedeRetorno.dto";
import { Sede } from "../entity/sede.entity";

export const toRespuestaSede = (dato?: Sede): DtoSedeRespuesta | undefined => {
  if (!dato) return undefined;
  const base = toRespuestaBase<Sede>(dato);
  if (!base) return undefined

  return {
    ...base,
    nombre: dato.nombre
  }
}
