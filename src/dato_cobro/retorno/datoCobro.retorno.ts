/**
 * Retorno de un dato de cobro.
 *
 * No extiende BaseRetorno porque la tabla dato_cobro no tiene
 * fecha_creacion, fecha_actualizacion ni deleted.
 */
export interface DatoCobroRetornoProp {
  id: string;
  nombre: string;
  mensaje?: string | null;
}

export class DatoCobroRetorno {
  id!: string;
  nombre!: string;
  mensaje?: string | null;

  constructor({ id, nombre, mensaje }: DatoCobroRetornoProp) {
    this.id = id;
    this.nombre = nombre;
    this.mensaje = mensaje;
  }
}
