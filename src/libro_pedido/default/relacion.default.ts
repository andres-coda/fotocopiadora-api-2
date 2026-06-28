import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { SELECTED_BASE } from "../../utils/relacion";
import { PedidoItem } from "../entity/pedido_item.entity";

export const LIBRO_PEDIDO_RELATIONS: RelationsKey<PedidoItem> = {
  relations: ['libro', 'pedido', 'sede', 'especificacion'],
  nestedRelations: {'pedido':{'cliente':{}}, 'libro':{componentes:{}}}
};

export const SELECTED_LIBRO_PEDIDO: SelectedDeep<PedidoItem> = {
  ...SELECTED_BASE,
  fechaCreacion:true,
  fechaActualizacion:true,
  estado:true,
  cantidad:true,
  detalles:true,
  especificaciones:{
    id:true,
    nombre:true,
  },

  libroId:true,
  pedidoId:true,

  libro:{
    id:true,
    nombre:true,
    anio:true,
    nivel:true,
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
    estado:true,
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

export const LIBRO_PEDIDO_ESTADO_RELATIONS: RelationsKey<PedidoItem> = {
  relations: ['libro', 'pedido'],
  nestedRelations: {'pedido':{'cliente':{}}, 'libro':{'stock':{}}}
};

export const SELECTED_LIBRO_PEDIDO_ESTADO:SelectedDeep<PedidoItem> = {
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