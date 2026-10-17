import { Role } from "@src/auth/rol/rol.enum";

/**
 * Vista de la empresa del usuario autenticado (GET /empresa/mia).
 * Los uuid crudos de la configuracion no se exponen: se devuelven los
 * nombres resueltos por join (sede, dato de cobro y los dos mensajes).
 */
export interface UsuarioEmpresaMia {
  id: string;
  nombre: string;
  email: string;
  role: Role;
}

export interface ConfiguracionEmpresaMia {
  fechaActualizacion: Date;
  fechaEntrega?: string | null;
  horaEntrega?: number | null;
  msjRetiro?: boolean | null;
  msjEnvio?: boolean | null;
  sede?: string | null;
  datoCobro?: string | null;
  msjPedidoTomado?: string | null;
  msjPedidoRetirado?: string | null;
}

export interface EmpresaMiaRetorno {
  id: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  deleted?: boolean;
  nombre: string;
  telefono: string;
  email: string;
  configuracion: ConfiguracionEmpresaMia | null;
  usuarios?: UsuarioEmpresaMia[];
}
