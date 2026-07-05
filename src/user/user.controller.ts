import { BadRequestException, Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { UsuarioGuard } from '../auth/guard/user.guard';
import { AuthParcialDto } from '../auth/dto/authParcial.dto';
import { User } from './entity/user.entity';
import { UsuarioCrear } from './dto/userCrear.dto';
import { AdminGuard } from '../auth/guard/admin.guard';
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';
import { Role } from '@src/auth/rol/rol.enum';
import type { EditarUsuario, ModificarRole } from './interface/usuario.interface';

@Controller('user')
@UseGuards(UsuarioGuard)
export class UserController {
  public constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) { }

  @Get(':id')
  @HttpCode(200)
  async getUsuarioById(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<User> {
    const usuario = req.user;
    if(!usuario) throw new NotFoundException('Permiso denegado. Tienes que tener una cuenta para ingresar');
    if(usuario.role === Role.Operador && usuario.sub != id ) throw new NotFoundException('Permiso denegado. Tienes que ser el usuario logueado para acceder a tus datos');
    if (!usuario || id != usuario.sub) throw new NotFoundException("Acción prohibida. Solo puedes acceder a tus datos");

    return await this.userService.getDatoByIdOrFail(id, req.queryRunner);
  }

  @Post()
  @HttpCode(201)
  async createUsuario(
    @Body() datos: UsuarioCrear,
    @Request() req: RequestWithUser,
  ): Promise<{ access_token: string }> {
    console.log('controller crear usuario')
    const user: User = await this.userService.createUsuario(datos, req.queryRunner);
    if (!user) throw new BadRequestException('No se pudo crear el usuario');
    const token = await this.authService.signIn(user.email, user.password);
    return token
  }

  @Put()
  @UseGuards(UsuarioGuard)
  async updateUsuario(
    @Request() req: RequestWithUser,
    @Body() datos: EditarUsuario
  ): Promise<User> {
    const usuario = req.user;
    if (!usuario || datos.id != usuario.sub) throw new NotFoundException("Acción prohibida. Solo puedes acceder a tus datos");
    return await this.userService.updateUsuario(datos, req.queryRunner);
  }

  @Put('/role')
  @UseGuards(AdminGuard)
  async updateUsuarioRole(
    @Request() req: RequestWithUser,
    @Body() datos: ModificarRole
  ): Promise<User> {
    if (!datos.role) throw new NotFoundException('Debe incluir el nuevo rol para modificarlo')
    return await this.userService.modifyUsuarioRole(datos, req.queryRunner);
  }

}
