import { BaseDto } from "@src/base/dto/baseDto";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class DtoLibroEditar extends BaseDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  autor?: string;

  @IsOptional()
  @IsString()
  edicion?: string;

  @IsOptional()
  @IsString()
  img?: string;

  @IsOptional()
  @IsNumber()
  cantidadPg?: number;

  @IsOptional()
  @IsString()
  materia?: string;
}