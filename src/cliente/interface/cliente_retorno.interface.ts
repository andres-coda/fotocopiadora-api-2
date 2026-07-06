export interface ClienteRetorno {
  id:string,
  nombre?:string;
  telefono?: string;
  email?: string;
  pendiente?: number;
  listo?:number;
  retirado?:number;
  cancelado?:number;
  fecha_creacion:Date;
  fecha_actualizacion:Date;
  deleted:boolean
}