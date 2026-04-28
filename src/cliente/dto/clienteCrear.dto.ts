import { BaseDto } from "../../base/dto/baseDto";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, ValidateIf } from "class-validator";

export class DtoClienteCrear extends BaseDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(1, 100, { message: 'El nombre no debe tener mas de 100 caracteres' })
  nombre?: string;
  
  @ValidateIf(o => !o.telefono)
  @IsNotEmpty({ message: 'Debe proporcionar email o teléfono' })
  @IsEmail({}, { message: 'El email no es válido' })
  email?: string;

  @ValidateIf(o => !o.email)
  @IsNotEmpty({ message: 'Debe proporcionar teléfono o email' })
  @IsString({ message: 'El telefono debe estar pasado en formato string' })
  @IsPhoneNumber('AR', { message: 'Debe ser un número de teléfono válido de Argentina' })
  telefono?: string
}