import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { AuthParcialDto } from "../dto/authParcial.dto";
import { UserService } from "@src/user/user.service";
import { User } from "@src/user/entity/user.entity";

@Injectable()
export class UsuarioGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private usuarioService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    try {
      // Obtener los datos parciales del token JWT
      const usuarioParcial: AuthParcialDto = await this.authService.getUserFromRequest(request);
      
      // Obtener el usuario completo de la base de datos
      const usuarioCompleto:User = await this.usuarioService.getDatoByIdOrFail({id:usuarioParcial.sub, entidadError:'usuario'});
      
      // Agregar tanto los datos parciales como el usuario completo al request
      request.user = usuarioParcial; // Para compatibilidad hacia atrás
      request.usuarioCompleto = usuarioCompleto; // Usuario completo
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o usuario no encontrado');
    }
  }
}