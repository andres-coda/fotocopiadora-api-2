/**
 * Retorno de un mensaje.
 *
 * No extiende BaseRetorno porque la tabla mensaje no tiene
 * fecha_creacion, fecha_actualizacion ni deleted.
 */
export interface MensajeRetornoProp {
  id: string;
  nombre: string;
  mensaje?: string | null;
}

export class MensajeRetorno {
  id!: string;
  nombre!: string;
  mensaje?: string | null;

  constructor({ id, nombre, mensaje }: MensajeRetornoProp) {
    this.id = id;
    this.nombre = nombre;
    this.mensaje = mensaje;
  }
}
