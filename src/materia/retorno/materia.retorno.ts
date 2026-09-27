import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";

export interface MateriaRetornoProp extends BaseRetornoProp{
  nombre:string;
}

export class MateriaRetorno extends BaseRetorno {
  nombre!: string;

  constructor({id, fecha_actualizacion, fecha_creacion, deleted, nombre}:MateriaRetornoProp) {
    super({id, fecha_actualizacion, fecha_creacion, deleted})
    this.nombre = nombre;
  }
}