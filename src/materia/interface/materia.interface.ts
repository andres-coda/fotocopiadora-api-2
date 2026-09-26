import { NAMES_MATERIAS } from "../default/materia.default";

export interface MateriaDefaultProp {
  nombre: typeof NAMES_MATERIAS[keyof typeof NAMES_MATERIAS];
}

export interface GetMateriaAdapter {
  id_materia: string;
  materia: string;
  deleted: boolean;
}

export interface GetMateriaProp {
  nombre: string,
  deleted: boolean,
  id: string
}