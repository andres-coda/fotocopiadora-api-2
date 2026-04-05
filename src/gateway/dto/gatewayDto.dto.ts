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
import { ClienteResumen } from "@src/cliente_resumen/entity/clienteResumen.entity";
import { Materia } from "@src/materia/entity/materia.entity";
import { Base } from "@src/base/entity/base.entity";

export const EntidadDatoMap = {
  cliente: {} as Cliente,
  esp: {} as Especificacion,
  libro: {} as Libro,
  libro_pedido: {} as LibroPedido,
  materia: {} as Materia,
  pedido: {} as Pedido,
  precio: {} as Precio,
  propuesta_pedido: {} as Propuesta,
  sede: {} as Sede,
  stock: {} as Stock,
  resumen: {} as ClienteResumen,
} satisfies Record<string, Base>;


export type EntidadDatoMapType = typeof EntidadDatoMap;

export const Entidad = Object.freeze(
  Object.fromEntries(
    Object.keys(EntidadDatoMap).map((key) => [key.toUpperCase(), key])
  )
) as {
    [K in keyof typeof EntidadDatoMap as Uppercase<K & string>]: K;
  };



export type Mensaje<
  K extends keyof EntidadDatoMapType = keyof EntidadDatoMapType
> =
  | {
    mensaje: Mens.ELIMINAR;
    entidad: K;
    id: string;
    dato?: never;
  }
  | {
    mensaje: Exclude<Mens, Mens.ELIMINAR>;
    entidad: K;
    dato: EntidadDatoMapType[K];
    id?: never;
  };

