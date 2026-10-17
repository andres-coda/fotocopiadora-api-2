import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class DtoMensajeCrear extends BaseDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio para crear el mensaje' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(1, 50, { message: 'El nombre no debe tener mas de 50 caracteres' })
  nombre!: string;

  @IsOptional()
  @IsString({ message: 'El mensaje debe ser un texto' })
  mensaje?: string;
}
