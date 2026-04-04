import { RelationsKey, SelectedDeep } from "@src/base/interface/base.interface";
import { Cliente } from "../entity/cliente.entity";
import { SELECTED_BASE } from "@src/utils/relacion";

export const CLIENTE_RELATIONS: RelationsKey<Cliente> = {
  relations:['pedidos'],
  nestedRelations: {'pedidos':{'libroPedidos':{}}}
};

export const CLIENTE_SELECTED: SelectedDeep<Cliente> = {
  ...SELECTED_BASE,
  telefono:true,
  email:true,
  nombre:true,
  pedidos:{
    libroPedidos:{
      estado:true,
      cantidad:true,
    }
  }
}