import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/auth.dto";
import { AuthParcialDto } from "./dto/authParcial.dto";
import type { RequestWithUser } from "./dto/RequestWhitUser.interface";
import { UsuarioGuard } from "./guard/user.guard";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    
    return this.authService.signIn(dto.nombre, dto.password);
  }

  // UsuarioGuard verifica el JWT y puebla request.user con su payload
  // (sub, nombre, role, idEmpresa), normalizando sub -> id. Sin el guard
  // request.user es undefined y Nest responde 200 con body vacio.
  // El guard va SOLO en este metodo: a nivel de clase tambien protegeria
  // /auth/login y nadie podria obtener un token.
  @UseGuards(UsuarioGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser): AuthParcialDto {
    return req.user;
  }
}