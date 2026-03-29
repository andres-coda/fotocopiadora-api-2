import { BaseDto } from "@src/base/dto/baseDto";
import { Estado } from "@src/interface/estado.interface";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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