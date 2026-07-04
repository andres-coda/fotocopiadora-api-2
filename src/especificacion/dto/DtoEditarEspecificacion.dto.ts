import { BaseDto } from "../../base/dto/baseDto";
import { IsEnum, IsNotEmpty } from "class-validator";
import { Especificaciones } from "../../pedido_item/interface/especificaciones.interface";

export class DtoEspecificacionEditar extends BaseDto {
  @IsNotEmpty({ message: 'Debe proporcionar el nombre de la especificación para editarla' })
  @IsEnum(Especificaciones, {message: 'Debe coincidir con los nombres proporcionados previamente en el enum'})
  nombre!: Especificaciones;
}