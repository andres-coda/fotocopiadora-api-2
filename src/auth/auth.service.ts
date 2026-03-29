import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthParcialDto } from './dto/authParcial.dto';
import { Request } from 'express';
import { UserService } from '@src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService, private jwtService: JwtService) { }
  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user || user.password !== pass) throw new UnauthorizedException();

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  //método utilizado para UsuarioGuard
  async getUserFromRequest(request: Request): Promise<AuthParcialDto> {
    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException();
    // El encabezado de autorización debería tener el formato "Bearer token"
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token no válido');
    }
    try {
      // Decodificar el token JWT para obtener los datos del usuario
      const user = this.jwtService.verify(token);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}