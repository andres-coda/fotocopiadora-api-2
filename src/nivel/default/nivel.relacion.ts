import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { SELECTED_BASE } from "../../utils/relacion";
import { Nivel } from "../entity/nivel.entity";

export const NIVEL_RELATIONS: RelationsKey<Nivel> = {
  relations: [],
  nestedRelations: {}
};

export const SELECTED_NIVEL: SelectedDeep<Nivel> = {
  ...SELECTED_BASE,
  nombre:true,
}