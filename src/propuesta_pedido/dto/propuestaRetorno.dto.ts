import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { DtoLibroRespuesta } from "../../libro/dto/libroRetorno.dto";

export class DtoPropuestaRespuesta extends DtoBaseRetorno {
  nombre!:string;
  libro!: DtoLibroRespuesta[];
}