import { Controller, Get, HttpCode, Query, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Componente } from './entity/componente.entity';
import { DtoComponenteCrear } from './dto/componenteCrear.dto';
import { DtoComponenteEditar } from './dto/componenteEditar.dto';
import { ComponenteService } from './componente.service';
import { COMPONENTE_RELATIONS, SELECTED_COMPONENTE, SELECTED_COMPONENTE_BY_ID } from './default/relacion.default';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { RetornoGenericoControllerGet } from '@src/interface/general.interface';
import { DtoComponenteRespuesta } from './dto/componenteRetorno.dto';
import { RetornoGet } from '@src/base/interface/base.interface';
import { UsuarioGuard } from '@src/auth/guard/user.guard';

@Controller('componente')
@UseGuards(UsuarioGuard)
export class ComponenteController extends BaseController<typeof Entidad.COMPONENTE, Componente, DtoComponenteCrear, DtoComponenteEditar, ComponenteService> {
  constructor(
    protected readonly componenteService: ComponenteService,
  ) {
    super(componenteService, Entidad.COMPONENTE, 'componente', [COMPONENTE_RELATIONS], 'nombre', SELECTED_COMPONENTE_BY_ID, undefined, SELECTED_COMPONENTE)
  }

  @Get()
  @HttpCode(200)
  async buscarComponente(
    @Request() req: RequestWithUser,
    @Query('q') busqueda: string,
    @Query('pagina') pg = 1,
    @Query('limite') limite = 20,
  ): Promise<RetornoGet<typeof Entidad.COMPONENTE>> {
    const pagina: number = pg > 0 ? Number(pg) : 1;
    const offset = (Number(pagina) - 1) * Number(limite);
    if (busqueda) {
      const retorno = await this.componenteService.buscarComponenteNombre({
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

    const retorno = await this.componenteService.getDatoCx({
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