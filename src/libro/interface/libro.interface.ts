import { NAMES_COMPONENTE } from "../../componente/default/componente.default";
import { Especificaciones } from "../../libro_pedido/interface/especificaciones.interface";
import { NAMES_MATERIAS } from "../../materia/default/materia.default";
import { NAMES_LIBRO } from "../default/libro_name.default";

export interface LibroDefaultProp {
  nombre: typeof NAMES_LIBRO[keyof typeof NAMES_LIBRO];
  descripcion?: string;
  autor?: string;
  edicion?: number;
  nivel?: string;
  editorial?: string;
  anio?: string;
  img?: string;
  cantidadPg: number;
  adhesivos?: number;
  materia: typeof NAMES_MATERIAS[keyof typeof NAMES_MATERIAS];
  componentes?:  typeof NAMES_COMPONENTE[keyof typeof NAMES_COMPONENTE][];
  especificacionesDefecto?: Especificaciones[];
}