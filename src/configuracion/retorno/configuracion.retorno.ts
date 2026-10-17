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
  fechaActualizacion: Date;
  fechaEntrega?: string | null;
  horaEntrega?: number | null;
  idSede?: string | null;
  idDatoCobro?: string | null;
  idMsjPedidoTomado?: string | null;
  idMsjPedidoRetirado?: string | null;
  msjRetiro?: boolean | null;
  msjEnvio?: boolean | null;
}

export class ConfiguracionRetorno {
  idEmpresa!: string;
  fechaActualizacion!: Date;
  fechaEntrega?: string | null;
  horaEntrega?: number | null;
  idSede?: string | null;
  idDatoCobro?: string | null;
  idMsjPedidoTomado?: string | null;
  idMsjPedidoRetirado?: string | null;
  msjRetiro?: boolean | null;
  msjEnvio?: boolean | null;

  constructor({
    idEmpresa,
    fechaActualizacion,
    fechaEntrega,
    horaEntrega,
    idSede,
    idDatoCobro,
    idMsjPedidoTomado,
    idMsjPedidoRetirado,
    msjRetiro,
    msjEnvio,
  }: ConfiguracionRetornoProp) {
    this.idEmpresa = idEmpresa;
    this.fechaActualizacion = fechaActualizacion;
    this.fechaEntrega = fechaEntrega;
    this.horaEntrega = horaEntrega;
    this.idSede = idSede;
    this.idDatoCobro = idDatoCobro;
    this.idMsjPedidoTomado = idMsjPedidoTomado;
    this.idMsjPedidoRetirado = idMsjPedidoRetirado;
    this.msjRetiro = msjRetiro;
    this.msjEnvio = msjEnvio;
  }
}
