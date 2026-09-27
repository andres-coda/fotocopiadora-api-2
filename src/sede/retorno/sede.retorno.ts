import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";

export interface SedeRetornoProp extends BaseRetornoProp{
  nombre:string;
}

export class SedeRetorno extends BaseRetorno {
  nombre!: string;

  constructor({id, fecha_actualizacion, fecha_creacion, deleted, nombre}:SedeRetornoProp) {
    super({id, fecha_actualizacion, fecha_creacion, deleted})
    this.nombre = nombre;
  }
}