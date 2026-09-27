import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";
import { PrecioAbareviatura } from "../interface/precio.interface";

export interface PrecioRetornoProp extends Omit<BaseRetornoProp, 'id'> {
  idPrecio: string;
  nombre: string;
  descripcion?: string;
  importe: number;
  detalles?: string;
  abreviatura?: string;
}

export class PrecioRetorno extends BaseRetorno {
  nombre!: string;
  descripcion?: string;
  abreviatura?: PrecioAbareviatura;
  importe!: number;

  constructor({ idPrecio, fecha_actualizacion, fecha_creacion, deleted, nombre, abreviatura, descripcion, importe }: PrecioRetornoProp) {
    super({ id: idPrecio, fecha_actualizacion, fecha_creacion, deleted })
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.abreviatura = abreviatura as PrecioAbareviatura;
    this.importe = importe;
  }
}