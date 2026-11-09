import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";

export interface SedeRetornoProp extends BaseRetornoProp{
  nombre:string;
  idEmpresa?:string;
}

export class SedeRetorno extends BaseRetorno {
  nombre!: string;
  idEmpresa?:string;

  constructor({id, fecha_actualizacion, fecha_creacion, deleted, nombre, idEmpresa}:SedeRetornoProp) {
    super({id, fecha_actualizacion, fecha_creacion, deleted})
    this.nombre = nombre;
    this.idEmpresa = idEmpresa;
  }
}