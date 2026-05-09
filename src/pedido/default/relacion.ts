import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { Pedido } from "../entity/pedido.entity";
import { SELECTED_BASE } from "../../utils/relacion";

export const PEDIDO_RELATIONS: RelationsKey<Pedido> = {
  relations:['libroPedidos'],
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
    libroPedidos:{
      id:true,
      estado:true,
    }
}

export const PEDIDO_RELATIONS_BY_ID: RelationsKey<Pedido> = {
  relations:['libroPedidos', 'cliente'],
  nestedRelations: {
    'libroPedidos': {
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
    libroPedidos:{
      id:true,
      estado:true,
      cantidad:true,
      especificaciones:{
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
  relations:['libroPedidos', 'cliente'],
  nestedRelations: {
    'libroPedidos': {
      'libro':{}, 
      'especificaciones':{}
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
    libroPedidos:{
      id:true,
      estado:true,
      especificaciones:{
        id:true,
        nombre:true,
      },
      libro:{
        id:true,
      }
    }
}