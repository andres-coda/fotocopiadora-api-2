import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";
import { DtoLibroRespuesta } from "@src/libro/dto/libroRetorno.dto";

export class DtoPropuestaRespuesta extends DtoBaseRetorno {
  nombre!:string;
  libro!: DtoLibroRespuesta[];
}