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

export interface ConfiguracionEmpresaMiaDetalle {
  fechaActualizacion: Date;
  fechaEntrega?: string;
  horaEntrega?: number;
  msjRetiro?: boolean;
  msjEnvio?: boolean;
  sede?: string;
  datoCobro?: string;
  msjPedidoTomado?: string;
  msjPedidoRetirado?: string;
}

/**
 * Retorno exacto de vw_empresa_completa: 21 columnas, una fila por empresa.
 * Los campos de relacion son nullables porque la vista usa LEFT JOIN.
 */
export interface ConfiguracionEmpresaMia {
  id: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  deleted: boolean;
  nombre: string;
  email: string;
  telefono: string;
  fecha_entrega: string;
  id_dato_cobro: string;
  id_msj_pedido_tomado: string;
  id_msj_pedido_retirado: string;
  id_sede: string;
  msj_retiro: boolean;
  msj_envio: boolean;
  hora_entrega: number;
  dato_cobro_nombre: string;
  dato_cobro_mensaje: string;
  retirado_nombre: string;
  retirado_mensaje: string;
  tomado_nombre: string;
  tomado_mensaje: string;
  sede: string;
  config_fecha_actualizacion: Date;
}

export interface EmpresaMiaRetorno {
  id: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  deleted?: boolean;
  nombre: string;
  telefono: string;
  email: string;
  configuracion: ConfiguracionEmpresaMiaDetalle;
  usuarios?: UsuarioEmpresaMia[];
}
