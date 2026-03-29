import { RelationsKey, SelectedDeep } from "@src/base/interface/base.interface";
import { Libro } from "../entity/libro.entity";
import { SELECTED_BASE } from "@src/utils/relacion";

export const LIBRO_RELATIONS: RelationsKey<Libro> = {
  relations: ['materia', 'stock'],
  nestedRelations: {}
};

export const SELECTED_LIBRO: SelectedDeep<Libro> = {
  ...SELECTED_BASE,
  materia: {
    id: true,
    nombre: true
  },
  stock: {
    id: true,
    stock: true,
    pendiente: true,
    listo: true,
    retirado: true,
    cancelado: true,
  }
}