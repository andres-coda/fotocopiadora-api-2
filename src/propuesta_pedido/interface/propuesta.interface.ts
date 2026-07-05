import { Especificaciones } from "@src/pedido_item/interface/especificaciones.interface";
import { NAMES_PROPUESTA } from "../default/propuesta.default";

export interface PropuestaDefaultProp {  
  nombre: typeof NAMES_PROPUESTA[keyof typeof NAMES_PROPUESTA];
  libros: string[]
}

export interface PropuestaVistaProp {
  id_libro:string;
  id_propuesta:string;
  id_materia: string;
  nombre_propuesta:string;
  fecha_creacion:Date;
  fecha_actualizacion:Date;
  deleted_propuesta:boolean;
  nombre:string;
  descripcion:string;
  edicion:number;
  autor:string;
  anio:string;
  img:string;
  nivel:string;
  componentes:string;
  cantidad_pg:number;
  cantidad_adhesivo:number;
  especificaciones_defecto:Especificaciones[];
  materia:string;
  editorial:string;
  detalle_impresion:string;
  deleted:boolean;
}