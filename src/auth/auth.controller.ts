import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/auth.dto";
import { AuthParcialDto } from "./dto/authParcial.dto";
import type { RequestWithUser } from "./dto/RequestWhitUser.interface";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    return this.authService.signIn(dto.nombre, dto.password);
  }

  @Get('profile')
  getProfile(@Request() req: RequestWithUser): AuthParcialDto {
    return req.user;
  }
}