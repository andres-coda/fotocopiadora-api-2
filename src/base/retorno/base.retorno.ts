export class DtoBaseRetorno {
  id!: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  deleted?: boolean;

  constructor(id: string, fecha_creacion?:Date, fecha_actualizacion?:Date, deleted?:boolean) {
    this.id = id;
    this.fechaActualizacion = fecha_actualizacion;
    this.fechaCreacion = fecha_creacion;
    this.deleted = deleted;
  }
}