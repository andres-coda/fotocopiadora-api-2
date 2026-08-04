import { Controller, Get, HttpCode, Query, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Nivel } from './entity/nivel.entity';
import { DtoNivelCrear, DtoNivelEditar } from './dto/nivel.dto';
import { NIVEL_RELATIONS, SELECTED_NIVEL } from './default/nivel.relacion';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { RetornoGet } from '@src/base/interface/base.interface';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { NivelService } from './nivel.service';

@Controller('nivel')
@UseGuards(UsuarioGuard)
export class NivelController extends BaseController<typeof Entidad.NIVEL, Nivel, DtoNivelCrear, DtoNivelEditar, NivelService> {
  constructor(
    protected readonly nivelService: NivelService,
  ) {
    super(nivelService, Entidad.NIVEL, 'nivel', [NIVEL_RELATIONS], 'nombre', SELECTED_NIVEL, undefined, SELECTED_NIVEL)
  }

  @Get()
  @HttpCode(200)
  async buscarNivel(
    @Request() req: RequestWithUser,
    @Query('q') busqueda: string,
    @Query('pagina') pg = 1,
    @Query('limite') limite = 20,
  ): Promise<RetornoGet<typeof Entidad.NIVEL>> {
    const pagina: number = pg > 0 ? Number(pg) : 1;
    const offset = (Number(pagina) - 1) * Number(limite);
    if (busqueda) {
      const retorno = await this.nivelService.buscarNivelNombre({
        limite: Number(limite),
        offset,
        qR: req.queryRunner,
        busqueda
      });

      return {
        total: retorno.total,
        limite,
        pagina,
        datos: retorno.datos
      }
    }

    const retorno = await this.nivelService.getDatoCx({
      limite: Number(limite),
      offset,
      qR: req.queryRunner
    });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos
    }
  }
}