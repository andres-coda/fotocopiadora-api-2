import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { Stock } from "../entity/stock.entity";
import { SELECTED_BASE } from "../../utils/relacion";

export const STOCK_RELATIONS: RelationsKey<Stock> = {
  relations:[],
  nestedRelations: {}
};

export const STOCK_SELECTED: SelectedDeep<Stock> = {
  ...SELECTED_BASE,
}