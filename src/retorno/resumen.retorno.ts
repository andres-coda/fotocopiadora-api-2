import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";

export interface ResumenRetornoProp extends BaseRetornoProp{
  pendiente: number;
  listo: number;
  retirado: number; 
  cancelado: number;
  stock?: number;
}

export class ResumenRetorno extends BaseRetorno {
  pendiente!: number;
  listo!: number;
  retirado!: number; 
  cancelado!: number;
  stock?: number;

  constructor({id, fecha_actualizacion, fecha_creacion, deleted, pendiente, listo, retirado, cancelado, stock}:ResumenRetornoProp) {
    super({id, fecha_actualizacion, fecha_creacion, deleted})
    this.pendiente = pendiente;
    this.listo = listo;
    this.retirado = retirado;
    this.cancelado = cancelado;
    this.stock = stock
  }
}