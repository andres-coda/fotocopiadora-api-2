import { BaseDto } from "@src/base/dto/baseDto";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class DtoLibroCrear extends BaseDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

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

  @IsNotEmpty()
  @IsNumber()
  cantidadPg!: number;

  @IsNotEmpty()
  @IsString()
  materia!: string;
}