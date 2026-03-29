import { BaseDto } from "@src/base/dto/baseDto";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class DtoPrecioEditar extends BaseDto {
  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsNumber()
  importe?: number;
}