import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { SELECTED_BASE } from "../../utils/relacion";
import { Editorial } from "../entity/editorial.entity";

export const EDITORIAL_RELATIONS: RelationsKey<Editorial> = {
  relations: [],
  nestedRelations: {}
};

export const SELECTED_EDITORIAL: SelectedDeep<Editorial> = {
  ...SELECTED_BASE,
  nombre:true,
}