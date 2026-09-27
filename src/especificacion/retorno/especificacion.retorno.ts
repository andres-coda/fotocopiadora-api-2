import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";

export interface EspecificacionRetornoProp extends BaseRetornoProp {
  nombre: string;
}

export class EspecificacionRetorno extends BaseRetorno {
  nombre!: string;


  constructor({ id, fecha_actualizacion, fecha_creacion, deleted, nombre }: EspecificacionRetornoProp) {
    super({ id, fecha_actualizacion, fecha_creacion, deleted })
    this.nombre = nombre;
  }
}