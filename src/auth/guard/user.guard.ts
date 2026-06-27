import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { AuthParcialDto } from "../dto/authParcial.dto";
/**
 * Guard base: verifica que el request tenga un JWT válido
 * y puebla request.user con el payload.
 * El DbContextInterceptor luego usará request.user.id para
 * setear el GUC en la transacción.
 */
@Injectable()
export class UsuarioGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    try {
      const usuario: AuthParcialDto = this.authService.getUserFromRequest(request);
      // Normalizamos sub → id para que el interceptor lo encuentre como request.user.id
      request.user = { ...usuario, id: usuario.sub };
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o usuario no encontrado');
    }
  }
}