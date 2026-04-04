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

export const CLIENTE_SELECTED_BY_ID: SelectedDeep<Cliente> = {
  ...CLIENTE_SELECTED,
  pedidos:{
    id:true,
    anillados:true,
    archivos:true,
    fechaCreacion:true,
    fechaEntrega:true,
    importeTotal:true,
    sena:true,
    libroPedidos:{
      id:true,
      estado:true,
    }
  }
}