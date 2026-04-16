import { BaseDto } from "../../base/dto/baseDto";
import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from "class-validator";

export class DtoClienteEditar extends BaseDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(0, 100, { message: 'El nombre no debe tener mas de 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email no es válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El telefono debe estar pasado en formato string' })
  @IsPhoneNumber('AR', { message: 'Debe ser un número de teléfono válido de Argentina' })
  telefono?: string
}