import { BaseDto } from "../../base/dto/baseDto";
import { IsOptional, IsString, Length } from "class-validator";

export class DtoDatoCobroEditar extends BaseDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(1, 50, { message: 'El nombre no debe tener mas de 50 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El mensaje debe ser un texto' })
  mensaje?: string;
}
