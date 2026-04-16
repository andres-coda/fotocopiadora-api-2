import { Libro } from "../../libro/entity/libro.entity";
import { Mens } from "../enum/Mens.enum";
import { Cliente } from "../../cliente/entity/cliente.entity";
import { Pedido } from "../../pedido/entity/pedido.entity";
import { Precio } from "../../precio/entity/precio.entity";
import { Sede } from "../../sede/entity/sede.entity";
import { Stock } from "../../stock/entity/stock.entity";
import { Especificacion } from "../../especificacion/entity/especificacion.entity";
import { Propuesta } from "../../propuesta_pedido/entity/propuesta_pedido.entity";
import { LibroPedido } from "../../libro_pedido/entity/libroPedido.entity";
import { ClienteResumen } from "../../cliente_resumen/entity/clienteResumen.entity";
import { Materia } from "../../materia/entity/materia.entity";
import { Base } from "../../base/entity/base.entity";
import { TestEntity } from "../../base/__test__/base.service.spec";
import { Componente } from "../../componente/entity/componente.entity";

export const EntidadDatoMap = {
  cliente: {} as Cliente,
  componente: {} as Componente,
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
  testEntity: {} as TestEntity
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

