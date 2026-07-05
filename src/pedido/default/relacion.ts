import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { Pedido } from "../entity/pedido.entity";
import { SELECTED_BASE } from "../../utils/relacion";

export const PEDIDO_RELATIONS: RelationsKey<Pedido> = {
  relations:['pedidoItems', 'cliente'],
  nestedRelations: {}
};

export const PEDIDO_SELECTED: SelectedDeep<Pedido> = {
  ...SELECTED_BASE,  
    anillados:true,
    archivos:true,
    fechaCreacion:true,
    fechaEntrega:true,
    importeTotal:true,
    estado:true, 
    sena:true,
    pedidoItems:{
      id:true,
      estado:true,
    },
    cliente:{
      id:true,
      nombre:true,
      telefono:true,
      email:true,
    }
}