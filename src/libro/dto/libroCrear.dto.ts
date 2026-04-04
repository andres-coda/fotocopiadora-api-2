import { BaseDto } from "@src/base/dto/baseDto";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches } from "class-validator";

export class DtoLibroCrear extends BaseDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;

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

  @IsNotEmpty({ message: 'La cantidad de páginas es obligatoria' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad de páginas debe ser un número' })
  cantidadPg!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad de adhesivos debe ser un número' })
  adhesivos?: number;

  @IsNotEmpty({ message: 'La materia es obligatoria' })
  @IsString({ message: 'La materia debe ser un texto' })
  materia!: string;
}