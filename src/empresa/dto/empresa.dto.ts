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

  // Datos del primer usuario admin de la empresa.
  // Se crean en la misma transaccion que la empresa.
  @IsNotEmpty({ message: 'Debe proporcionar el nombre del administrador' })
  @IsString({ message: 'El nombre del administrador debe ser un texto' })
  @Length(1, 50, { message: 'El nombre del administrador no debe superar los 50 caracteres' })
  adminNombre!: string;

  @IsNotEmpty({ message: 'Debe proporcionar el email del administrador' })
  @IsEmail({}, { message: 'El email del administrador no es válido' })
  adminEmail!: string;

  @IsNotEmpty({ message: 'Debe proporcionar la contraseña del administrador' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @Length(6, 255, { message: 'La contraseña debe tener entre 6 y 255 caracteres' })
  adminPassword!: string;
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