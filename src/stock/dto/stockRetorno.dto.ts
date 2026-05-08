import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";

export class DtoStockRespuesta extends DtoBaseRetorno {
  stock!: number;
  pendiente!: number;
  listo!: number;
  retirado!: number;
  cancelado!: number;
}