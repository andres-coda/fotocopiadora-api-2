import { RelationsKey, SelectedDeep } from "@src/base/interface/base.interface";
import { Sede } from "../entity/sede.entity";
import { SELECTED_BASE } from "@src/utils/relacion";

export const SEDE_RELATIONS: RelationsKey<Sede> = {
  relations:[],
  nestedRelations: {}
};

export const SEDE_SELECTED: SelectedDeep<Sede> = {
  ...SELECTED_BASE,
}