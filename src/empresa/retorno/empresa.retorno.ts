import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";
import { ConfiguracionRetorno, ConfiguracionRetornoProp } from "@src/configuracion/retorno/configuracion.retorno";

export interface EmpresaRetornoProp extends BaseRetornoProp {
  nombre: string;
  telefono: string;
  email: string;
}

interface ConfiguracionRetornoVistaProp {
  id: string;
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

export class EmpresaRetorno extends BaseRetorno {
  nombre!: string;
  telefono!: string;
  email!: string;
  configuracion?: ConfiguracionRetorno;


  constructor({ id, fecha_actualizacion, fecha_creacion, deleted, nombre, telefono, email }: EmpresaRetornoProp) {
    super({ id, fecha_actualizacion, fecha_creacion, deleted })
    this.nombre = nombre;
    this.telefono = telefono;
    this.email = email;
  }

  public agregarConfiguracion({
    id, config_fecha_actualizacion, fecha_entrega, hora_entrega, msj_retiro, msj_envio,
    id_sede, sede, id_dato_cobro, dato_cobro_mensaje, dato_cobro_nombre,
    id_msj_pedido_retirado, retirado_mensaje, retirado_nombre,
    id_msj_pedido_tomado, tomado_mensaje, tomado_nombre
  }: ConfiguracionRetornoVistaProp) {
    const config = new ConfiguracionRetorno({
      idEmpresa: id,
      fechaActualizacion: config_fecha_actualizacion,
      fechaEntrega: fecha_entrega,
      horaEntrega: hora_entrega,
      msjRetiro: msj_retiro,
      msjEnvio: msj_envio
    });

    if (id_msj_pedido_retirado)
      config.agregarMsjRetirado({ id: id_msj_pedido_retirado, mensaje: retirado_mensaje, nombre: retirado_nombre });
    if (id_msj_pedido_tomado)
      config.agregarMsjTomado({ id: id_msj_pedido_tomado, mensaje: tomado_mensaje, nombre: tomado_nombre });
    if (id_dato_cobro)
      config.agregarDatoCobro({ id: id_dato_cobro, mensaje: dato_cobro_mensaje, nombre: dato_cobro_nombre });
    if (id_sede)
      config.agregarSede({ id: id_sede, nombre: sede });
    
    this.configuracion = config;
  }
}