import { BaseDto } from "@src/base/dto/baseDto";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class DtoPedidoEditar extends BaseDto {
  @IsOptional()
  @IsString()
  fechaEntrega?: string;

  @IsOptional()
  @IsNumber()
  importeTotal?: number;

  @IsOptional()
  @IsNumber()
  sena?: number;

  @IsOptional()
  @IsNumber()
  anillados?: number;

  @IsOptional()
  @IsNumber()
  archivos?: number;

  /* @IsNotEmpty()
  @Type(() => Persona)
  @IsString()
  cliente: Persona; */
}