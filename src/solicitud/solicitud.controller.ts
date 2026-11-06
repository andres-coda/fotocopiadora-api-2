import { Body, Controller, Get, HttpCode, Param, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '../auth/guard/user.guard';
import { SuperAdminGuard } from '../auth/guard/superAdmin.guard';
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';
import { SolicitudService } from './solicitud.service';
import { DtoSolicitudResolver } from './dto/solicitud.dto';
import { SolicitudRetorno } from './retorno/solicitud.retorno';

@Controller('solicitud')
@UseGuards(UsuarioGuard)
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) { }

  @Get()
  @HttpCode(200)
  @UseGuards(SuperAdminGuard)
  async getSolicitudes(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Request() req: RequestWithUser,
  ): Promise<{ total: number; limite: number; pagina: number; datos: SolicitudRetorno[]; query: string }> {
    const offset = (pagina - 1) * limite;
    const retorno = await this.solicitudService.getSolicitudes(req.queryRunner, Number(limite), offset);
    return {
      total: retorno.total,
      limite: Number(limite),
      pagina: Number(pagina),
      datos: retorno.datos,
      query: '',
    };
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(SuperAdminGuard)
  async getSolicitudById(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<SolicitudRetorno> {
    return this.solicitudService.getSolicitudById(req.queryRunner, id);
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(SuperAdminGuard)
  async resolverSolicitud(
    @Param('id') id: string,
    @Body() datos: DtoSolicitudResolver,
    @Request() req: RequestWithUser,
  ): Promise<SolicitudRetorno> {
    return this.solicitudService.resolverSolicitud(req.queryRunner, id, datos);
  }
}