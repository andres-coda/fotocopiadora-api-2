import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";
import { PrecioAbareviatura } from "../interface/precio.interface";

export interface PrecioCategoriaRetornoProp {
  id: string;
  nombre: string;
}

/**
 * Categoria con la marca de uso de la empresa actual.
 *
 * `usada` indica si la empresa tiene al menos un precio en esa categoria.
 * El lateral muestra siempre las `bloqueado`, y el modal de filtros solo las
 * no bloqueadas que la empresa usa.
 */
export interface PrecioCategoriaUsoRetornoProp extends PrecioCategoriaRetornoProp {
  bloqueado: boolean;
  usada: boolean;
}

export interface PrecioRetornoProp extends Omit<BaseRetornoProp, 'id'> {
  idPrecio: string;
  nombre: string;
  descripcion?: string;
  importe: number;
  detalles?: string;
  abreviatura?: string;
  categoria?: PrecioCategoriaRetornoProp;
}

export class PrecioRetorno extends BaseRetorno {
  nombre!: string;
  descripcion?: string;
  abreviatura?: PrecioAbareviatura;
  importe!: number;
  categoria?: PrecioCategoriaRetornoProp;

  constructor({ idPrecio, fecha_actualizacion, fecha_creacion, deleted, nombre, abreviatura, descripcion, importe, categoria }: PrecioRetornoProp) {
    super({ id: idPrecio, fecha_actualizacion, fecha_creacion, deleted })
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.abreviatura = abreviatura as PrecioAbareviatura;
    this.importe = importe;
    this.categoria = categoria;
  }
}