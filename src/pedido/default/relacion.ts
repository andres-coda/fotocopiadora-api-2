import { RelationsKey, SelectedDeep } from "@src/base/interface/base.interface";
import { Pedido } from "../entity/pedido.entity";
import { SELECTED_BASE } from "@src/utils/relacion";

export const PEDIDO_RELATIONS: RelationsKey<Pedido> = {
  relations:[],
  nestedRelations: {}
};

export const PEDIDO_SELECTED: SelectedDeep<Pedido> = {
  ...SELECTED_BASE,  
    anillados:true,
    archivos:true,
    fechaCreacion:true,
    fechaEntrega:true,
    importeTotal:true,
    sena:true,
}