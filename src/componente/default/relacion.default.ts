import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { SELECTED_BASE } from "../../utils/relacion";
import { Componente } from "../entity/componente.entity";

export const COMPONENTE_RELATIONS: RelationsKey<Componente> = {
  relations: [],
  nestedRelations: {}
};

export const SELECTED_COMPONENTE: SelectedDeep<Componente> = {
  ...SELECTED_BASE,
  nombre:true,
}

export const SELECTED_COMPONENTE_BY_ID: SelectedDeep<Componente> = {
  ...SELECTED_COMPONENTE,
  fechaActualizacion:true,
  fechaCreacion:true,
}