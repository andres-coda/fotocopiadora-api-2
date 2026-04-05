import { BaseDto } from "@src/base/dto/baseDto";
import { Estado } from "@src/interface/estado.interface";
import { IsEnum, IsNotEmpty } from "class-validator";

export class DtoResumenEditar extends BaseDto {
  @IsNotEmpty()
  @IsEnum(Estado)
  anterior!: Estado;

  @IsNotEmpty()
  @IsEnum(Estado)
  actual!: Estado;
}
