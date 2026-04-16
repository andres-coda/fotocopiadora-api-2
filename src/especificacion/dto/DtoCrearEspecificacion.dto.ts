import { BaseDto } from "../../base/dto/baseDto";
import { Especificaciones } from "../../libro_pedido/interface/especificaciones.interface";
import { IsEnum, IsNotEmpty } from "class-validator";

export class DtoEspecificacionCrear extends BaseDto {
  
  @IsNotEmpty({ message: 'Debe proporcionar el nombre de la especificación para crearla' })
  @IsEnum(Especificaciones, {message: 'Debe coincidir con los nombres proporcionados previamente en el enum'})
  nombre!: Especificaciones;
}