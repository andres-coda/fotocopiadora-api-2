import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../rol/rol.enum";
import { ROLES_KEY } from "../rol/rol.decorador";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
      if (!requiredRoles || !Array.isArray(requiredRoles)) {
      
      return false;
    }

    const { user } = context.switchToHttp().getRequest();
    
    return requiredRoles.includes(user.role);
  }
}