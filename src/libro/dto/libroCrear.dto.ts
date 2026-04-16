import { BaseDto } from "../../base/dto/baseDto";
import { Especificaciones } from "../../libro_pedido/interface/especificaciones.interface";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches } from "class-validator";

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
  @Type(() => Number)
  @IsNumber({}, { message: 'La edición debe ser un número' })
  edicion?: number;

  @IsOptional()
  @IsString({ message: 'El nivel debe ser un texto' })
  nivel?: string;

  @IsOptional()
  @IsString({ message: 'La editorial debe ser un texto' })
  editorial?: string;

  @IsOptional()
  @IsString({ message: 'El año debe ser un texto' })
  @Matches(/^\d{4}$/, { message: 'El año debe tener formato YYYY (ej: 2024)' })
  anio?: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una URL válida' })
  img?: string;

  @IsNotEmpty({ message: 'La cantidad de páginas es obligatoria' })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad de páginas debe ser un número entero' })
  cantidadPg!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La cantidad de adhesivos debe ser un número entero' })
  adhesivos?: number;

  @IsNotEmpty({ message: 'La materia es obligatoria' })
  @IsString({ message: 'La materia debe ser un texto' })
  materia!: string;

  @IsOptional()
  @IsArray({ message: 'El componente debe ser un array' })
  @IsString({ each: true, message: 'Cada componente debe ser un texto' })
  componentes?: string[];

  @IsOptional()
  @IsArray({ message: 'Las especificaciones deben ser un array' })
  @IsEnum(Especificaciones, { each: true, message: 'Especificación inválida' })
  especificacionesDefecto?: Especificaciones[];
}