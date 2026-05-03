import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { SELECTED_BASE } from "../../utils/relacion";
import { Componente } from "../entity/componente.entity";
import { DtoComponenteCrear } from "../dto/componenteCrear.dto";

export const COMPONENTE_RELATIONS: RelationsKey<Componente> = {
  relations: [],
  nestedRelations: {}
};

export const SELECTED_COMPONENTE: SelectedDeep<Componente> = {
  ...SELECTED_BASE,
  nombre:true,
}