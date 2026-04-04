export interface ClienteRetorno {
  id:string,
  nombre?:string;
  telefono?: string;
  email?: string;
  pendientes?: number;
  listo?:number;
}