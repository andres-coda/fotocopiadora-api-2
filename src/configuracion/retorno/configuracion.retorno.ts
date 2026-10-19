import { DatoCobroRetorno, DatoCobroRetornoProp } from "@src/dato_cobro/retorno/datoCobro.retorno";
import { MensajeRetorno, MensajeRetornoProp } from "@src/mensaje/retorno/mensaje.retorno";
import { SedeRetorno, SedeRetornoProp } from "@src/sede/retorno/sede.retorno";

/**
 * Retorno de la configuracion de una empresa.
 *
 * No extiende BaseRetorno porque la tabla configuraciones no tiene
 * fecha_creacion ni deleted, y su PK es id_empresa (no id).
 * Devuelve la fila cruda (con los uuid de las relaciones) para el front
 * que necesite editarla. Los nombres resueltos van en GET /empresa/mia.
 */
export interface ConfiguracionRetornoProp {
  idEmpresa: string;
  fechaActualizacion?: Date;
  fechaEntrega?: string;
  horaEntrega?: number;
  msjRetiro?: boolean;
  msjEnvio?: boolean;
}

export class ConfiguracionRetorno {
  idEmpresa!: string;
  fechaActualizacion?: Date;
  fechaEntrega?: string;
  horaEntrega?: number;
  msjRetiro?: boolean;
  msjEnvio?: boolean;

  msjRetirado?: MensajeRetorno;
  msjTomado?: MensajeRetorno;
  sede?: SedeRetorno;
  datoCobrado?: DatoCobroRetorno;

  constructor({
    idEmpresa,
    fechaActualizacion,
    fechaEntrega,
    horaEntrega,
    msjRetiro,
    msjEnvio,
  }: ConfiguracionRetornoProp) {
    this.idEmpresa = idEmpresa;
    this.fechaActualizacion = fechaActualizacion;
    this.fechaEntrega = fechaEntrega;
    this.horaEntrega = horaEntrega;
    this.msjRetiro = msjRetiro;
    this.msjEnvio = msjEnvio;
  }

  public agregarMsjRetirado({id, nombre, mensaje, favorito}:MensajeRetornoProp){
    const msj = new MensajeRetorno({id, nombre, mensaje, favorito});
    this.msjRetirado = msj;
  }

  public agregarMsjTomado({id, nombre, mensaje, favorito}:MensajeRetornoProp){
    const msj = new MensajeRetorno({id, nombre, mensaje, favorito});
    this.msjTomado = msj;
  }

  public agregarSede({id, nombre}:SedeRetornoProp){
    const sede = new SedeRetorno({id, nombre});
    this.sede = sede;
  }

  public agregarDatoCobro({id, nombre, mensaje }:DatoCobroRetornoProp){
    const dc = new DatoCobroRetorno({id, nombre, mensaje})
    this.datoCobrado = dc;
  }
}
