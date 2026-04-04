import { RelationsKey, SelectedDeep } from "@src/base/interface/base.interface";
import { SELECTED_BASE } from "@src/utils/relacion";
import { Propuesta } from "../entity/propuesta_pedido.entity";

export const PROPUESTA_RELATIONS: RelationsKey<Propuesta> = {
  relations: ['libro'],
  nestedRelations: {}
};

export const PROPUESTA_SELECTED: SelectedDeep<Propuesta> = {
  ...SELECTED_BASE,
  nombre: true,
  libro: {
    id: true,
    nombre: true,
    anio: true,
    cantidadPg: true,
    adhesivo: true
  }
}