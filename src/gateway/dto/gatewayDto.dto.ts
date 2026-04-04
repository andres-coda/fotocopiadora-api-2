import { Libro } from "@src/libro/entity/libro.entity";
import { Mens } from "../enum/Mens.enum";
import { Cliente } from "@src/cliente/entity/cliente.entity";
import { Pedido } from "@src/pedido/entity/pedido.entity";
import { Precio } from "@src/precio/entity/precio.entity";
import { Sede } from "@src/sede/entity/sede.entity";
import { Stock } from "@src/stock/entity/stock.entity";
import { Especificacion } from "@src/especificacion/entity/especificacion.entity";
import { Propuesta } from "@src/propuesta_pedido/entity/propuesta_pedido.entity";
import { LibroPedido } from "@src/libro_pedido/entity/libroPedido.entity";

export const Entidad = {
  "CLIENTE":"cliente",
  "ESPECIFICACIONES" : "esp",
  "ESTADO": "estado",
  "LIBRO":"libro",
  "LIBRO_PEDIDO":"libro_pedido",
  "MATERIA":"materia",
  "PEDIDO":"pedido",
  "PROPUESTA_PEDIDO":"propuesta_pedido",
  "PRECIO":"precio",
  "SEDE": "sede",
  "STOCK": "stock",
  "USER": "user"
} as const;

export type EntidadType =(typeof Entidad)[keyof typeof Entidad];

interface retornoSocket{
  libro?:Libro,
  cliente?:Cliente,
  pedido?:Pedido,
  precio?:Precio,
  sede?:Sede,
  stock?:Stock,
  propuesta?:Propuesta,
  libroPedido?:LibroPedido,
}

export interface Mensaje{
  mensaje:Mens;
  entidad:EntidadType;
  dato?:retornoSocket;
  id?:string;
}
