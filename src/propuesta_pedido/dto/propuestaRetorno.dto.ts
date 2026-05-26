import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { DtoLibroRespuesta } from "../../libro/dto/libroRetorno.dto";

export class DtoPropuestaLibroRetorno extends DtoBaseRetorno {
  nombre!:string;
}

export class DtoPropuestaRespuesta extends DtoPropuestaLibroRetorno {
  libro!: DtoLibroRespuesta[];
}