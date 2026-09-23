import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { Cliente } from "../entity/cliente.entity";
import { SELECTED_BASE } from "../../utils/relacion";

export const CLIENTE_RELATIONS: RelationsKey<Cliente> = {
  relations: ['resumen'],
  nestedRelations: {}
};

export const CLIENTE_X_RESUMEN_SELECTED: SelectedDeep<Cliente> = {
  ...SELECTED_BASE,
  telefono: true,
  email: true,
  nombre: true,
  resumen: {
    pendiente: true,
    listo: true,
    retirado: true,
    cancelado:true
  }
}
