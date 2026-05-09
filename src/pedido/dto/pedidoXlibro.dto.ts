import { IsEnum, IsNotEmpty } from "class-validator";
import { BaseDto } from "../../base/dto/baseDto";
import { Estado } from "@src/interface/estado.interface";

export class DtoPedidoXLibro extends BaseDto{
  @IsNotEmpty()
  @IsEnum(Estado)
  estado!:Estado
}