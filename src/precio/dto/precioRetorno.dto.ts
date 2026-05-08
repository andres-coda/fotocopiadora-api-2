import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";

export class DtoPrecioRespuesta extends DtoBaseRetorno {
  nombre!: string;
  importe!: number;
}