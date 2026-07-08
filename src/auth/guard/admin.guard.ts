import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Role } from "../rol/rol.enum";
import { AuthService } from "../auth.service";
import { AuthParcialDto } from "../dto/authParcial.dto";
/**
 * Requiere rol admin o super_admin.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    try {
      const usuario: AuthParcialDto =this.authService.getUserFromRequest(request);

      if (usuario.role !== Role.Admin && usuario.role !== Role.SuperAdmin) {
        throw new UnauthorizedException('Se requiere rol de administrador.');
      }

      request.user = { ...usuario, id: usuario.sub };
      return true;
    } catch(er) {
      throw new UnauthorizedException(er,'Token inválido o permisos insuficientes');
    }
  }
}