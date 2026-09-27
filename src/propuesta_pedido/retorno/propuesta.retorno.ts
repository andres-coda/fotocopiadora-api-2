import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";
import { LibroMinimoRetornoProp, LibroRetorno, LibroRetornoProp, LibroVistaPropuestaRetornoProp } from "@src/libro/retorno/libro.retorno";
import { MateriaRetornoProp } from "@src/materia/retorno/materia.retorno";

export interface PropuestaRetornoProp extends BaseRetornoProp {
  nombre: string;
}

export interface LibroPropuestaProp extends LibroMinimoRetornoProp, LibroRetornoProp {
  materia: string;
  id_materia: string;
}

interface agregarLibroApropuestaRetornoProp extends Omit<LibroVistaPropuestaRetornoProp, 'deleted'>, LibroRetornoProp {

}

export class PropuestaRetorno extends BaseRetorno {
  nombre!: string;
  libros!: LibroRetorno[];

  constructor({ id, fecha_actualizacion, fecha_creacion, deleted, nombre }: PropuestaRetornoProp) {
    super({ id, fecha_actualizacion, fecha_creacion, deleted })
    this.nombre = nombre;
    this.libros = [];
  }

  public agregarLibroApropuestaRetorno({
    id, fecha_actualizacion, fecha_creacion, deleted, nombre, editorial,
    id_materia, descripcion, edicion, autor, anio, img, nivel, componentes, cantidad_pg, cantidad_adhesivo, especificaciones_defecto,
    materia, detalle_impresion
  }: agregarLibroApropuestaRetornoProp) {
    const libro = new LibroRetorno({
      id, fecha_actualizacion, fecha_creacion, deleted, nombre, editorial
    });
    libro.armarLibroPropuesta({
      id_materia, descripcion, edicion, autor, anio, img, nivel, componentes, cantidad_pg, cantidad_adhesivo, especificaciones_defecto,
      materia, detalle_impresion, deleted: deleted ?? false
    });
    this.libros.push(libro);
  }
}