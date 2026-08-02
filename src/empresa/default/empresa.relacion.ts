import { RelationsKey, SelectedDeep } from "@src/base/interface/base.interface";
import { Empresa } from "../entity/empresa.entity";
import { SELECTED_BASE } from "@src/utils/relacion";

export const EMPRESA_RELATIONS: RelationsKey<Empresa> = {
  relations: [],
  nestedRelations: {}
};

export const EMPRESA_SELECTED: SelectedDeep<Empresa> = {
  ...SELECTED_BASE,
  telefono: true,
  email: true,
  nombre: true,
}