import { BaseDto } from "@src/base/dto/baseDto";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Matches } from "class-validator";

export class DtoLibroEditar extends BaseDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @IsOptional()
  @IsString({ message: 'El autor debe ser un texto' })
  autor?: string;

  @IsOptional()
  @IsString({ message: 'La editorial debe ser un texto' })
  editorial?: string;

  @IsOptional()
  @IsString({ message: 'El año debe ser un texto' })
  @Matches(/^\d{4}$/, { message: 'El año debe tener formato YYYY (ej: 2024)' })
  anio?: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una url en texto' })
  img?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad de páginas debe ser un número' })
  cantidadPg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad de adhesivos debe ser un número' })
  adhesivos?: number;

  @IsOptional()
  @IsString({ message: 'La materia debe ser un texto' })
  materia?: string;
}