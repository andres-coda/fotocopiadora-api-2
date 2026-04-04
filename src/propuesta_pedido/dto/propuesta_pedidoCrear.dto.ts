import { BaseDto } from "@src/base/dto/baseDto";
import { IsArray, ArrayMinSize, IsNotEmpty, IsString, IsUUID, ArrayUnique } from "class-validator";

export class DtoPropuestaCrear extends BaseDto {
  @IsNotEmpty({ message: 'El pedido predeterminado debe tener un nombre' })
  @IsString({ message: 'Debe ser string' })
  nombre!: string;

  @IsArray({ message: 'Debe enviar un arreglo de libros' })
  @ArrayMinSize(1, { message: 'Debe enviar al menos un libro para ser cargado' })
  @ArrayUnique({ message: 'No puede haber libros duplicados' })
  @IsUUID('4', { each: true, message: 'Cada id debe ser un UUID válido' })
  libros!: string[];
}