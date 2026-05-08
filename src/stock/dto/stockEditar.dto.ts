import { BaseDto } from "../../base/dto/baseDto";
import { Estado } from "../../interface/estado.interface";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class DtoStockEditar extends BaseDto {
  @IsOptional()
  @IsEnum(Estado)
  anterior?: Estado;

  @IsNotEmpty()
  @IsEnum(Estado)
  actual!: Estado;

  @IsNotEmpty()
  @IsNumber()
  cantidad!: number;
}