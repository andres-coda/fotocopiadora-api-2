import { GetMateriaAdapter, GetMateriaProp } from "../interface/materia.interface";

export const toRespuestaMateria = (dato?: GetMateriaAdapter): GetMateriaProp | undefined => {
  if (!dato?.materia || !dato?.id_materia) return undefined;
  return {
    nombre: dato.materia,
    deleted: false,
    id: dato.id_materia
  }
}