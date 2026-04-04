import { BaseDto } from "@src/base/dto/baseDto";
import { IsEnum, IsNotEmpty } from "class-validator";
import { Especificaciones } from "@src/libro_pedido/interface/especificaciones.interface";

export class DtoEspecificacionEditar extends BaseDto {
  @IsNotEmpty({ message: 'Debe proporcionar el nombre de la especificación para editarla' })
  @IsEnum(Especificaciones, {message: 'Debe coincidir con los nombres proporcionados previamente en el enum'})
  nombre!: Especificaciones;
}