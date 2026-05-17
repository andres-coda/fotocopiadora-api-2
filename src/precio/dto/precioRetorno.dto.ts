import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { PrecioAbareviatura } from "../interface/precio.interface";

export class DtoPrecioRespuesta extends DtoBaseRetorno {
  nombre!: string;
  importe!: number;
  abreviatura?: PrecioAbareviatura[];
}