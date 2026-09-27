import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";

export interface EmpresaRetornoProp extends BaseRetornoProp {
  nombre: string;
  telefono: string;
  email: string;
}

export class EmpresaRetorno extends BaseRetorno {
  nombre!: string;
  telefono!: string;
  email!: string;


  constructor({ id, fecha_actualizacion, fecha_creacion, deleted, nombre, telefono, email }: EmpresaRetornoProp) {
    super({ id, fecha_actualizacion, fecha_creacion, deleted })
    this.nombre = nombre;
    this.telefono = telefono;
    this.email = email;
  }
}