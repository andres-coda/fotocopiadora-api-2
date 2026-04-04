import { RelationsKey, SelectedDeep } from "@src/base/interface/base.interface";
import { SELECTED_BASE } from "@src/utils/relacion";
import { Especificacion } from "../entity/especificacion.entity";

export const ESPECIFICACION_RELATIONS: RelationsKey<Especificacion> = {
  relations: [],
  nestedRelations: {}
};

export const SELECTED_ESPECIFICACION: SelectedDeep<Especificacion> = {
  ...SELECTED_BASE,
}