import { NAMES_MATERIAS } from "../default/materia.default";

export interface MateriaDefaultProp {  
  nombre: typeof NAMES_MATERIAS[keyof typeof NAMES_MATERIAS];
}