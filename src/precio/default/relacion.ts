import { RelationsKey, SelectedDeep } from "@src/base/interface/base.interface";
import { Precio } from "../entity/precio.entity";
import { SELECTED_BASE } from "@src/utils/relacion";

export const PRECIO_RELATIONS: RelationsKey<Precio> = {
  relations:[],
  nestedRelations: {}
};

export const PRECIO_SELECTED: SelectedDeep<Precio> = {
  ...SELECTED_BASE,
}