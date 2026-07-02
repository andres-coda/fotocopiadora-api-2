import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { Pedido } from "../entity/pedido.entity";
import { SELECTED_BASE } from "../../utils/relacion";

export const PEDIDO_RELATIONS: RelationsKey<Pedido> = {
  relations:['pedidoItems', 'cliente'],
  nestedRelations: {'cliente':{'resumen':{}}}
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
      resumen:{
        id:true
      }
    }
}

export const PEDIDO_RELATIONS_BY_ID: RelationsKey<Pedido> = {
  relations:['pedidoItems', 'cliente'],
  nestedRelations: {
    'pedidoItems': {
      'libro':{
        'componentes':{}, 
        'materia':{}
      }, 
      'especificaciones':{}
    }
  }
};


export const PEDIDO_SELECTED_BY_ID: SelectedDeep<Pedido> = {
  ...PEDIDO_SELECTED, 
    cliente: {
      id:true,
      telefono:true,
      nombre:true,
      email:true
    },
    pedidoItems:{
      id:true,
      estado:true,
      cantidad:true,
      especificacion:{
        id:true,
        nombre:true,
      },
      libro:{
        id:true,
        nombre:true,
        nivel:true,
        edicion:true,
        editorial:true,
        anio:true,
        componentes:{
          id:true,
          nombre:true
        }
      }
    }
}

export const PEDIDO_RELATIONS_LIBRO_ID: RelationsKey<Pedido> = {
  relations:['pedidoItems', 'cliente'],
  nestedRelations: {
    'pedidoItems': {
      'libro':{}, 
      'especificacion':{}
    }
  }
};

export const PEDIDO_SELECTED_LIBRO_ID: SelectedDeep<Pedido> = {
  ...PEDIDO_SELECTED, 
    cliente: {
      id:true,
      telefono:true,
      nombre:true,
      email:true
    },
    pedidoItems:{
      id:true,
      estado:true,
      especificacion:{
        id:true,
        nombre:true,
      },
      libro:{
        id:true,
      }
    }
}