import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { SELECTED_BASE } from "../../utils/relacion";
import { Materia } from "../entity/materia.entity";

export const MATERIA_RELATIONS: RelationsKey<Materia> = {
  relations:[],
  nestedRelations: {}
};

export const MATERIA_SELECTED: SelectedDeep<Materia> = {
  ...SELECTED_BASE,
  nombre:true
}