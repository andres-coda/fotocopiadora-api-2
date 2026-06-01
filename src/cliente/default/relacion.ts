import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { Cliente } from "../entity/cliente.entity";
import { SELECTED_BASE } from "../../utils/relacion";

export const CLIENTE_RELATIONS: RelationsKey<Cliente> = {
  relations: ['pedidos', 'resumen'],
  nestedRelations: {
    'pedidos': {
      'libroPedidos': {}
    }
  }
};

export const CLIENTE_X_RESUMEN_SELECTED: SelectedDeep<Cliente> = {
  ...SELECTED_BASE,
  telefono: true,
  email: true,
  nombre: true,
  resumen: {
    id: true,
    pendiente: true,
    listo: true,
    retirado: true,
  }
}

export const CLIENTE_SELECTED: SelectedDeep<Cliente> = {
  ...CLIENTE_X_RESUMEN_SELECTED,
  pedidos: {
    libroPedidos: {
      estado: true,
      cantidad: true,
    }
  }
}

export const CLIENTE_RELATIONS_BY_ID: RelationsKey<Cliente> = {
  relations: ['pedidos', 'resumen'],
  nestedRelations: {
    'pedidos': {
      'libroPedidos': {
        'libro': {
          'componentes': {}
        },
        "especificaciones": {}
      }
    }
  }
};

export const CLIENTE_SELECTED_BY_ID: SelectedDeep<Cliente> = {
  ...CLIENTE_SELECTED,
  fechaActualizacion: true,
  fechaCreacion: true,
  pedidos: {
    id: true,
    anillados: true,
    archivos: true,
    fechaCreacion: true,
    fechaEntrega: true,
    importeTotal: true,
    sena: true,
    libroPedidos: {
      id: true,
      estado: true,
      cantidad:true,
      especificaciones: {
        id: true,
        nombre: true
      },
      libro: {
        id: true,
        nombre: true,
        nivel: true,
        edicion: true,
        cantidadPg: true,
        adhesivo: true,
        componentes: {
          id: true,
          nombre: true
        }
      }
    }
  }
}

export const CLIENTE_X_RESUMEN_RELATIONS: RelationsKey<Cliente> = {
  relations: ['resumen'],
  nestedRelations: {}
};

