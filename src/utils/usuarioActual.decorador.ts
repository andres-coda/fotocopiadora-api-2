import { createParamDecorator, ExecutionContext, NotFoundException } from '@nestjs/common';
import { AuthParcialDto } from '../auth/dto/authParcial.dto';

/**
 * Decorador que extrae el usuario autenticado del request.
 * Retorna el payload del JWT (AuthParcialDto) con id, nombre, rol e idEmpresa.
 *
 * Cambios respecto a la versión anterior:
 * - Se eliminó UsuarioCompleto: ya no es necesario resolver el User completo
 *   desde la BD en cada request. El contexto de empresa lo maneja el RLS
 *   de PostgreSQL vía GUC, y el rol viene en el JWT.
 */

export const UsuarioActual = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthParcialDto => {
    if (ctx.getType() !== 'http')
      throw new NotFoundException('No se encontró contexto para la petición http');

    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthParcialDto;
  },
);