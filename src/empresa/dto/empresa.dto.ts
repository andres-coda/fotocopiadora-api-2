import { BaseDto } from "@src/base/dto/baseDto";
import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length } from "class-validator";

export class DtoEmpresaCrear extends BaseDto {
  @IsNotEmpty({message: 'Debe proporcionar un nombre para la empresa'})
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(1, 50, { message: 'El nombre no debe tener mas de 50 caracteres' })
  nombre!: string;

  @IsNotEmpty({ message: 'Debe proporcionar email' })
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsNotEmpty({ message: 'Debe proporcionar teléfono' })
  @IsString({ message: 'El telefono debe estar pasado en formato string' })
  @IsPhoneNumber(undefined, { message: 'Debe ser un número de teléfono válido con código de país' })
  telefono!: string;
}

// ------------- DTO EDITAR ---------------//

export class DtoEmpresaEditar extends BaseDto {
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

export class DtoEmpresaRespuesta extends DtoBaseRetorno{
  nombre!: string;
  telefono!: string;
  email!: string;  
}