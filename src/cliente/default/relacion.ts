import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { Cliente } from "../entity/cliente.entity";
import { SELECTED_BASE } from "../../utils/relacion";

export const CLIENTE_RELATIONS: RelationsKey<Cliente> = {
  relations:['pedidos', 'resumen'],
  nestedRelations: {'pedidos':{'libroPedidos':{}}}
};

export const CLIENTE_SELECTED: SelectedDeep<Cliente> = {
  ...SELECTED_BASE,
  telefono:true,
  email:true,
  nombre:true,
  fechaActualizacion:false,
  fechaCreacion:false,
  pedidos:{
    libroPedidos:{
      estado:true,
      cantidad:true,
    }
  },
  resumen:{
    id:true,
    pendiente:true,
    listo:true,
    retirado:true,
  }
}

export const CLIENTE_SELECTED_BY_ID: SelectedDeep<Cliente> = {
  ...CLIENTE_SELECTED,
  fechaActualizacion:true,
  fechaCreacion:true,
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