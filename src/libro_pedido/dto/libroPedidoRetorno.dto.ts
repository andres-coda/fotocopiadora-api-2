import { Estado } from "../../interface/estado.interface";
import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { DtoLibroRespuesta } from "../../libro/dto/libroRetorno.dto";
import { DtoSedeRespuesta } from "../../sede/dto/sedeRetorno.dto";
import { DtoEspecificaionRetorno } from "../../especificacion/dto/DtoEspecificacionRetorno.dto";

export class DtoLibroPedidoRespuesta extends DtoBaseRetorno {
  cantidad?: number;
  detalles?: string;
  estado!: Estado;
  libro?: DtoLibroRespuesta;
  sede?: DtoSedeRespuesta;
  especificaciones?: DtoEspecificaionRetorno[];
}