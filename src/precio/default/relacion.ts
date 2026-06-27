import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { Precio } from "../entity/precio.entity";
import { SELECTED_BASE } from "../../utils/relacion";
import { PrecioEmpresa } from "../entity/precio_empresa.entity";

export const PRECIO_RELATIONS: RelationsKey<Precio> = {
  relations:[],
  nestedRelations: {}
};

export const PRECIO_SELECTED: SelectedDeep<Precio> = {
  ...SELECTED_BASE,
  nombre:true,
}

export const PRECIO_SELECTED_BY_ID: SelectedDeep<Precio> = {
  ...PRECIO_SELECTED,
  fechaActualizacion:true,
  fechaCreacion:true,
}
