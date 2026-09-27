export interface BaseRetornoProp {
  id: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  deleted?: boolean;
}

export class BaseRetorno {
  id!: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  deleted?: boolean;

  constructor({id, fecha_actualizacion, fecha_creacion, deleted}:BaseRetornoProp) {
    this.id = id;
    this.fechaActualizacion = fecha_actualizacion;
    this.fechaCreacion = fecha_creacion;
    this.deleted = deleted ?? false;
  }
}