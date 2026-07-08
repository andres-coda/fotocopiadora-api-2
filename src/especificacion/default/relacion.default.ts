import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { Especificacion } from "../entity/especificacion.entity";

export const ESPECIFICACION_RELATIONS: RelationsKey<Especificacion> = {
  relations: [],
  nestedRelations: {}
};

export const SELECTED_ESPECIFICACION: SelectedDeep<Especificacion> = {
  id: true,
  deleted: true,
  nombre:true
}