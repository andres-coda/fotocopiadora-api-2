import { RelationsKey, SelectedDeep } from "@src/base/interface/base.interface";
import { SELECTED_BASE } from "@src/utils/relacion";
import { Materia } from "../entity/materia.entity";

export const MATERIA_RELATIONS: RelationsKey<Materia> = {
  relations:[],
  nestedRelations: {}
};

export const MATERIA_SELECTED: SelectedDeep<Materia> = {
  ...SELECTED_BASE,
}