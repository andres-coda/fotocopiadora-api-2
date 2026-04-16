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
    async signIn(@Body() signInDto: LoginDto): Promise<{ access_token: string }> {
      return await this.authService.signIn(signInDto.email, signInDto.password);
    }  
  
    @Get('profile')
    async getUserFromRequest(@Request() req: RequestWithUser):Promise<AuthParcialDto> {
      return await this.authService.getUserFromRequest(req);
    }  
  }