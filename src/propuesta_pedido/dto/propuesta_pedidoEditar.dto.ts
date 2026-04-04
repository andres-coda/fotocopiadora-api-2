import { ArrayMinSize, ArrayUnique, IsArray, IsOptional, IsString, IsUUID } from "class-validator";
import { BaseDto } from "@src/base/dto/baseDto";

export class DtoPropuestaEditar extends BaseDto {
  @IsOptional()
  @IsString({ message: 'El nombre del pedido predeterminado debe ser un string' })
  nombre?: string;

  @IsArray({ message: 'Debe enviar un arreglo de libros' })
  @ArrayMinSize(1, { message: 'Debe enviar al menos un libro para ser cargado' })
  @ArrayUnique({ message: 'No puede haber libros duplicados' })
  @IsUUID('4', { each: true, message: 'Cada id debe ser un UUID válido' })
  libros!: string[];
}