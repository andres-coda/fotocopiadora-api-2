import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";

export class DtoPrecioRespuesta extends DtoBaseRetorno {
  nombre!: string;
  importe!: number;
}