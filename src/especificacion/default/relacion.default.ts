import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { SELECTED_BASE } from "../../utils/relacion";
import { Especificacion } from "../entity/especificacion.entity";

export const ESPECIFICACION_RELATIONS: RelationsKey<Especificacion> = {
  relations: [],
  nestedRelations: {}
};

export const SELECTED_ESPECIFICACION: SelectedDeep<Especificacion> = {
  ...SELECTED_BASE,
}