import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";

export class DtoResumenRespuesta extends DtoBaseRetorno{
  pendiente!: number;
  listo!: number;
  retirado!: number;  
}