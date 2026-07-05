import { Mens } from "../enum/Mens.enum";
import { DtoClienteRespuesta } from "../../cliente/dto/cliente.dto";
import { DtoComponenteRespuesta } from "../../componente/dto/componenteRetorno.dto";
import { DtoEspecificaionRetorno } from "../../especificacion/dto/DtoEspecificacionRetorno.dto";
import { DtoLibroRespuesta } from "../../libro/dto/libroRetorno.dto";
import { DtoPedidoItemRespuesta } from "../../pedido_item/dto/pedido_item.dto";
import { DtoMateriaRespuesta } from "../../materia/dto/materiaRetorno.dto";
import { DtoPedidoRespuesta } from "../../pedido/dto/pedido.dto";
import { DtoPrecioRespuesta } from "../../precio/dto/precio.dto";
import { DtoPropuestaRespuesta } from "../../propuesta_pedido/dto/propuestaRetorno.dto";
import { DtoSedeRespuesta } from "../../sede/dto/sedeRetorno.dto";
import { DtoResumenRespuesta } from "../../libro/dto/resumen.dto";
import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";

export const EntidadDatoMap = {
  cliente: {} as DtoClienteRespuesta,
  componente: {} as DtoComponenteRespuesta,
  esp: {} as DtoEspecificaionRetorno,
  libro: {} as DtoLibroRespuesta,
  materia: {} as DtoMateriaRespuesta,
  pedido: {} as DtoPedidoRespuesta,
  precio: {} as DtoPrecioRespuesta,
  propuesta_pedido: {} as DtoPropuestaRespuesta,
  sede: {} as DtoSedeRespuesta,
} satisfies Record<string, DtoBaseRetorno>;


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

