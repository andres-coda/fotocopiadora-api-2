import { BaseDto } from "../../base/dto/baseDto";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class DtoPrecioEditar extends BaseDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsNumber()
  importe?: number;
}