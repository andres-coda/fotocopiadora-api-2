import { Body, Controller, Get, HttpCode, Put, Request, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '../auth/guard/user.guard';
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';
import { ConfiguracionService } from './configuracion.service';
import { DtoConfiguracionEditar } from './dto/configuracionEditar.dto';
import { ConfiguracionRetorno } from './retorno/configuracion.retorno';

/**
 * Endpoints de configuracion de la empresa.
 * Solo lectura y edicion: la fila la crea el trigger de insercion de empresa
 * y la BD no da policy de insert ni delete sobre configuraciones.
 * La empresa sale del JWT y se filtra explicitamente en el service; el RLS
 * de PostgreSQL queda como segunda capa.
 */
@Controller('configuracion')
@UseGuards(UsuarioGuard)
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) { }

  @Get()
  @HttpCode(200)
  async getConfiguracion(
    @Request() req: RequestWithUser,
  ): Promise<ConfiguracionRetorno> {
    return this.configuracionService.getConfiguracionOrFail(req.queryRunner, req.user?.idEmpresa);
  }

  @Put()
  @HttpCode(200)
  async updateConfiguracion(
    @Body() datos: DtoConfiguracionEditar,
    @Request() req: RequestWithUser,
  ): Promise<ConfiguracionRetorno> {
    return this.configuracionService.updateConfiguracion(req.queryRunner, datos, req.user?.idEmpresa);
  }
}
