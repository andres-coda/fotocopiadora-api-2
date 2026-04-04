import { BaseDto } from "@src/base/dto/baseDto";
import { IsEnum, IsNotEmpty } from "class-validator";
import { Estado } from "@src/interface/estado.interface";

export class DtoCambiarEstado extends BaseDto {
  @IsNotEmpty()
  @IsEnum(Estado)
  estado!: Estado;
}