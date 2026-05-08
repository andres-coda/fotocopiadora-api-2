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
import { TestEntity, TestEntityDto } from "../../base/__test__/base.service.spec";
import { Componente } from "../../componente/entity/componente.entity";
import { DtoClienteRespuesta } from "@src/cliente/dto/clienteRespuesta.dto";
import { DtoComponenteRespuesta } from "@src/componente/dto/componenteRetorno.dto";
import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";
import { DtoEspecificaionRetorno } from "@src/especificacion/dto/DtoEspecificacionRetorno.dto";
import { DtoLibroRespuesta } from "@src/libro/dto/libroRetorno.dto";
import { DtoLibroPedidoRespuesta } from "@src/libro_pedido/dto/libroPedidoRetorno.dto";
import { DtoMateriaRespuesta } from "@src/materia/dto/materiaRetorno.dto";
import { DtoPedidoRespuesta } from "@src/pedido/dto/pedidoRetorno.dto";
import { DtoPrecioRespuesta } from "@src/precio/dto/precioRetorno.dto";
import { DtoPropuestaRespuesta } from "@src/propuesta_pedido/dto/propuestaRetorno.dto";
import { DtoSedeRespuesta } from "@src/sede/dto/sedeRetorno.dto";
import { DtoStockRespuesta } from "@src/stock/dto/stockRetorno.dto";
import { DtoResumenRespuesta } from "@src/cliente_resumen/dto/clienteResumenRespuesta.dto";

export const EntidadDatoMap = {
  cliente: {} as DtoClienteRespuesta,
  componente: {} as DtoComponenteRespuesta,
  esp: {} as DtoEspecificaionRetorno,
  libro: {} as DtoLibroRespuesta,
  libro_pedido: {} as DtoLibroPedidoRespuesta,
  materia: {} as DtoMateriaRespuesta,
  pedido: {} as DtoPedidoRespuesta,
  precio: {} as DtoPrecioRespuesta,
  propuesta_pedido: {} as DtoPropuestaRespuesta,
  sede: {} as DtoSedeRespuesta,
  stock: {} as DtoStockRespuesta,
  resumen: {} as DtoResumenRespuesta,
  testEntity: {} as TestEntityDto,
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

