import { Role } from "@src/auth/rol/rol.enum";
import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";

export interface UsuarioRetornoProp extends BaseRetornoProp {
  nombre: string;
  email: string;
  role: Role;
}

export class UsuarioRetorno extends BaseRetorno {
  nombre!: string;
  email!: string;
  role!: Role;

  constructor({ id, fecha_actualizacion, fecha_creacion, deleted, nombre, email, role }: UsuarioRetornoProp) {
    super({ id, fecha_actualizacion, fecha_creacion, deleted })
    this.nombre = nombre;
    this.email = email;
    this.role = role;
  }
}