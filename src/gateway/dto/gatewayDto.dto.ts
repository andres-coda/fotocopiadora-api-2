import { Mens } from "../enum/Mens.enum";
import { ClienteRetorno } from "@src/cliente/retorno/cliente.retorno";
import { ComponenteRetorno } from "@src/componente/retorno/componente.retorno";
import { EspecificacionRetorno } from "@src/especificacion/retorno/especificacion.retorno";
import { LibroRetorno } from "@src/libro/retorno/libro.retorno";
import { MateriaRetorno } from "@src/materia/retorno/materia.retorno";
import { PedidoRetorno } from "@src/pedido/retorno/pedido.retorno";
import { PrecioRetorno } from "@src/precio/retorno/precio.retorno";
import { PropuestaRetorno } from "@src/propuesta_pedido/retorno/propuesta.retorno";
import { SedeRetorno } from "@src/sede/retorno/sede.retorno";
import { EmpresaRetorno } from "@src/empresa/retorno/empresa.retorno";
import { NivelRetorno } from "@src/nivel/retorno/nivel.retorno";
import { EditorialRetorno } from "@src/editorial/retorno/editorial.retorno";
import { BaseRetorno } from "@src/base/retorno/base.retorno";

export const EntidadDatoMap = {
  cliente: {} as ClienteRetorno,
  componente: {} as ComponenteRetorno,
  esp: {} as EspecificacionRetorno,
  libro: {} as LibroRetorno,
  materia: {} as MateriaRetorno,
  pedido: {} as PedidoRetorno,
  precio: {} as PrecioRetorno,
  propuesta_pedido: {} as PropuestaRetorno,
  sede: {} as SedeRetorno,
  empresa: {} as EmpresaRetorno,
  nivel: {} as NivelRetorno,
  editorial: {} as EditorialRetorno,
} satisfies Record<string, BaseRetorno>;


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

