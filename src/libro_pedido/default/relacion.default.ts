import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { SELECTED_BASE } from "../../utils/relacion";
import { LibroPedido } from "../entity/libroPedido.entity";

export const LIBRO_PEDIDO_RELATIONS: RelationsKey<LibroPedido> = {
  relations: ['libro', 'pedido', 'sede'],
  nestedRelations: {'pedido':{'cliente':{}}, 'libro':{componentes:{}}}
};

export const SELECTED_LIBRO_PEDIDO: SelectedDeep<LibroPedido> = {
  ...SELECTED_BASE,
  libro:{
    id:true,
    nombre:true,
    editorial:true,
    autor:true,
    cantidadPg:true,
    adhesivo:true,
    anio:true,
    componentes:{
      id:true,
      nombre:true
    }
  },
  pedido:{
    id:true,
    fechaEntrega:true,
    anillados:true,
    archivos:true, 
    cliente:{
      id:true,
      email:true,
      telefono: true,
      nombre: true,
    }
  },
  sede:{
    id:true,
    nombre:true
  }
}

export const LIBRO_PEDIDO_ESTADO_RELATIONS: RelationsKey<LibroPedido> = {
  relations: ['libro', 'pedido'],
  nestedRelations: {'pedido':{'cliente':{}}, 'libro':{'stock':{}}}
};

export const SELECTED_LIBRO_PEDIDO_ESTADO:SelectedDeep<LibroPedido> = {
  ...SELECTED_LIBRO_PEDIDO,
  libro:{
    id:true,
    nombre:true,
    editorial:true,
    autor:true,
    cantidadPg:true,
    adhesivo:true,
    anio:true,
    stock:{
      id:true
    }
  },
}