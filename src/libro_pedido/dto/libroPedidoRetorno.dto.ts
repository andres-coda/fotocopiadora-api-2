import { Estado } from "@src/interface/estado.interface";
import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { DtoLibroRespuesta } from "@src/libro/dto/libroRetorno.dto";
import { DtoSedeRespuesta } from "@src/sede/dto/sedeRetorno.dto";
import { Especificacion } from "@src/especificacion/entity/especificacion.entity";
import { DtoEspecificaionRetorno } from "@src/especificacion/dto/DtoEspecificacionRetorno.dto";

export class DtoLibroPedidoRespuesta extends DtoBaseRetorno {
  cantidad!: number;
  detalles?: string;
  estado!: Estado;
  libro!: DtoLibroRespuesta;
  sede!: DtoSedeRespuesta;
  especificaciones!: DtoEspecificaionRetorno[];
}