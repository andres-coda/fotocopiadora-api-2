import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { SELECTED_BASE } from "../../utils/relacion";
import { Propuesta } from "../entity/propuesta_pedido.entity";

export const PROPUESTA_RELATIONS: RelationsKey<Propuesta> = {
  relations: ['libros'],
  nestedRelations: {}
};

export const PROPUESTA_SELECTED: SelectedDeep<Propuesta> = {
  ...SELECTED_BASE,
  nombre: true,
  libros: {
    id_libro: true,
    cantidad_pg: true,
    cantidad_adhesivo: true,
    especificaciones_defecto:true,
  }
}