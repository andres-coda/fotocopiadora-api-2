import { Mens } from "../enum/Mens.enum";

export const Entidad = {
  "CLIENTE":"cliente",
  "ESPECIFICACIONES" : "esp",
  "ESTADO": "estado",
  "LIBRO":"libro",
  "LIBRO_PEDIDO":"libro_pedido",
  "MATERIA":"materia",
  "PEDIDO":"pedido",
  "PRECIO":"precio",
  "SEDE": "sede",
  "STOCK": "stock",
  "USER": "user"
} as const;

export type EntidadType =(typeof Entidad)[keyof typeof Entidad];

export interface Mensaje{
  mensaje:Mens;
  entidad:EntidadType;
  id:string;
}
