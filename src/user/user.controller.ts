import { BadRequestException, Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '@src/auth/auth.service';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { AuthParcialDto } from '@src/auth/dto/authParcial.dto';
import { User } from './entity/user.entity';
import { UsuarioCrear } from './dto/userCrear.dto';
import { AdminGuard } from '@src/auth/guard/admin.guard';

@Controller('user')
export class UserController {
  protected constructor(
    protected readonly userService: UserService,
    private readonly authService: AuthService,
  ) { }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(UsuarioGuard)
  async getUsuarioById(
    @Request() req: Request & { user: AuthParcialDto },
    @Param('id') id: string,
  ): Promise<User> {
    const usuario = req.user;
    if (!usuario || id != usuario.sub) throw new NotFoundException("Acción prohibida. Solo puedes acceder a tus datos");

    return await this.userService.getDatoByIdOrFail(id);
  }

  @Post()
  async createUsuario(@Body() datos: UsuarioCrear): Promise<{ access_token: string }> {
    const user: User = await this.userService.createUsuario(datos);
    if (!user) throw new BadRequestException('No se pudo crear el usuario');
    const token = await this.authService.signIn(user.email, user.password);
    return token
  }

  @Put(':id')
  @UseGuards(UsuarioGuard)
  async updateUsuario(
    @Request() req: Request & { user: AuthParcialDto },
    @Param('id') id: string,
    @Body() datos: UsuarioCrear
  ): Promise<User> {
    const usuario = req.user;
    if (!usuario || id != usuario.sub) throw new NotFoundException("Acción prohibida. Solo puedes acceder a tus datos");
    if (datos.role) return await this.userService.modifyUsuarioRole(id, datos.role);
    return await this.userService.updateUsuario(id, datos);
  }

  @Put(':id/role')
  @UseGuards(AdminGuard)
  async updateUsuarioRole(
    @Param('id') id: string,
    @Body() datos: UsuarioCrear
  ): Promise<User> {
    if (!datos.role) throw new NotFoundException('Debe incluir el nuevo rol para modificarlo')
    return await this.userService.modifyUsuarioRole(id, datos.role);
  }

}
