import { BaseDto } from "../../base/dto/baseDto";
import { Estado } from "../../interface/estado.interface";
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";

export class DtoResumenEditar extends BaseDto {
  @IsOptional()
  @IsEnum(Estado)
  anterior?: Estado;

  @IsNotEmpty()
  @IsEnum(Estado)
  actual!: Estado;
}
