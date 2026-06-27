import { Transform } from "class-transformer";
import { BaseDto } from "../../base/dto/baseDto";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, ValidateIf } from "class-validator";
import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";
import { DtoResumenClienteRespuesta } from "./cliente_resumen.dto";

// ------------- DTO CREAR ---------------//

export class DtoClienteCrear extends BaseDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(1, 50, { message: 'El nombre no debe tener mas de 50 caracteres' })
  nombre?: string;

  @Transform(({ value }) => value?.trim() || undefined)
  @ValidateIf(o => !o.telefono)
  @IsNotEmpty({ message: 'Debe proporcionar email o teléfono' })
  @IsEmail({}, { message: 'El email no es válido' })
  email?: string;

  @Transform(({ value }) => value?.trim() || undefined)
  @ValidateIf(o => !o.email)
  @IsNotEmpty({ message: 'Debe proporcionar teléfono o email' })
  @IsString({ message: 'El telefono debe estar pasado en formato string' })
  @IsPhoneNumber(undefined, { message: 'Debe ser un número de teléfono válido con código de país' })
  telefono?: string;
}

// ------------- DTO EDITAR ---------------//

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


// ------------- DTO RETORNO ---------------//

export class DtoClienteRespuesta extends DtoBaseRetorno{
  nombre?: string;
  telefono?: string;
  email?: string;  
  resumen?:DtoResumenClienteRespuesta;
}