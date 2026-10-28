import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

/**
 * Datos que un usuario puede cambiar de si mismo.
 *
 * La contrasena es opcional y viaja en dos campos: la actual, para poder
 * verificar identidad, y la nueva. El back no acepta cambiar una sin la otra.
 * `rol` e `id_empresa` no estan a proposito: el RLS rechaza cualquier intento de
 * moverlos desde un perfil propio, y no queremos que el contrato los insinue.
 */
export class EditarUsuarioDatos {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  nombre!: string;

  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email invalido' })
  @MaxLength(50, { message: 'El email no puede superar los 50 caracteres' })
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña actual debe tener al menos 6 caracteres' })
  @MaxLength(255, { message: 'La contraseña actual no puede superar los 255 caracteres' })
  passwordActual?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  @MaxLength(255, { message: 'La nueva contraseña no puede superar los 255 caracteres' })
  passwordNueva?: string;
}

/**
 * PUT /user. El id viaja en el body porque el controller valida que coincida con
 * el `sub` del token: un usuario solo puede editarse a si mismo.
 */
export class EditarUsuarioDto {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EditarUsuarioDatos)
  datos!: EditarUsuarioDatos;
}
