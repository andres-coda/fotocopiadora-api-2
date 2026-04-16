import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { Sede } from "../entity/sede.entity";
import { SELECTED_BASE } from "../../utils/relacion";

export const SEDE_RELATIONS: RelationsKey<Sede> = {
  relations:[],
  nestedRelations: {}
};

export const SEDE_SELECTED: SelectedDeep<Sede> = {
  ...SELECTED_BASE,
}