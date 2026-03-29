import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../constants";
import { Role } from "../rol/rol.enum";

@Injectable()
export class SuperAdminGuard implements CanActivate {
	constructor(private jwtService: JwtService) { }

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		try {
			if (!token) throw new UnauthorizedException('No tiene autorización para acceder a esa información');

			const payload = this.jwtService.verify(token, { secret: jwtConstants.secret });

			if (payload.role !== Role.SuperAdmin) {
				throw new UnauthorizedException('Acceso denegado: se requiere rol de administrador.');
			}

			request.user = payload;
			return true;
		} catch (error) {
			throw new UnauthorizedException('Token de autorización inválido. Debe loguearse');
		}
	}

	private extractTokenFromHeader(request: any): string | null {
		const authHeader = request.headers.authorization;
		if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
			return authHeader.split(' ')[1];
		}
		return null;
	}
}