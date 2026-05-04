import { RelationsKey, SelectedDeep } from "../../base/interface/base.interface";
import { Libro } from "../entity/libro.entity";
import { SELECTED_BASE } from "../../utils/relacion";

export const LIBRO_RELATIONS: RelationsKey<Libro> = {
  relations: ['materia', 'stock', 'componentes'],
  nestedRelations: {}
};

export const SELECTED_LIBROS_TODOS: SelectedDeep<Libro> = {
  ...SELECTED_BASE,
  nombre: true,
  cantidadPg: true,
  nivel: true,
  editorial: true,
  anio: true,
  adhesivo: true,
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
  },
  componentes: {
    id: true,
    nombre: true
  }
}

export const SELECTED_LIBRO: SelectedDeep<Libro> = {
  ...SELECTED_LIBROS_TODOS,
  descripcion: true,
  edicion: true,
  img: true
}

