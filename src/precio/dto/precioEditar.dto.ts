import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class DtoPrecioEditar extends BaseDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre?: string;
}