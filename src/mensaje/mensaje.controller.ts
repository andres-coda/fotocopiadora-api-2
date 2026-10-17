import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '../auth/guard/user.guard';
import { AdminGuard } from '../auth/guard/admin.guard';
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';
import { RetornoGenericoControllerGet, RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { MensajeService } from './mensaje.service';
import { DtoMensajeCrear } from './dto/mensajeCrear.dto';
import { DtoMensajeEditar } from './dto/mensajeEditar.dto';
import { MensajeRetorno } from './retorno/mensaje.retorno';

/**
 * Endpoints de mensajes por empresa.
 * Escritura restringida a admin (AdminGuard); lectura para cualquier usuario.
 * El RLS filtra automaticamente los datos de la empresa del usuario.
 */
@Controller('mensaje')
@UseGuards(UsuarioGuard)
export class MensajeController {
  constructor(private readonly mensajeService: MensajeService) { }

  @Get()
  @HttpCode(200)
  async getMensajes(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<MensajeRetorno>> {
    const offset = (pagina - 1) * limite;

    const retorno: RetornoGenericoServiceGet<MensajeRetorno> = await this.mensajeService.getMensajes({
      qR: req.queryRunner,
      limite,
      offset,
    });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos,
    };
  }

  /**
   * Listado completo sin paginar, para alimentar desplegables.
   * Se declara antes de ':id' para que la ruta fija no sea capturada por el parametro.
   */
  @Get('todas')
  @HttpCode(200)
  async getMensajesTodas(
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoServiceGet<MensajeRetorno>> {
    return this.mensajeService.getMensajesTodas(req.queryRunner);
  }

  @Get(':id')
  @HttpCode(200)
  async getMensajeById(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<MensajeRetorno> {
    return this.mensajeService.getMensajeByIdOrFail(req.queryRunner, id);
  }

  @Post()
  @UseGuards(AdminGuard)
  async createMensaje(
    @Body() datos: DtoMensajeCrear,
    @Request() req: RequestWithUser,
  ): Promise<MensajeRetorno> {
    return this.mensajeService.createMensaje(req.queryRunner, datos, req.user.idEmpresa);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async updateMensaje(
    @Param('id') id: string,
    @Body() datos: DtoMensajeEditar,
    @Request() req: RequestWithUser,
  ): Promise<MensajeRetorno> {
    return this.mensajeService.updateMensaje(req.queryRunner, id, datos);
  }

  /**
   * Elimina un mensaje de forma fisica.
   * Devuelve un body JSON (true) para que el front pueda hacer res.json().
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteMensaje(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    return this.mensajeService.deleteMensaje(req.queryRunner, id);
  }
}
