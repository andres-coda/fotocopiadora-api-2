import { BaseDto } from "@src/base/dto/baseDto";
import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from "class-validator";

export class DtoClienteEditar extends BaseDto {
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'El nombre no debe tener mas de 100 caracteres' })
  nombre!: string;
  
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('AR', { message: 'Debe ser un número de teléfono válido de Argentina' })
  telefono?: string
}