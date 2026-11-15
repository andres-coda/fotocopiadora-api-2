import { Controller, Get, HttpCode, Query, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Componente } from './entity/componente.entity';
import { DtoComponenteCrear } from './dto/componenteCrear.dto';
import { DtoComponenteEditar } from './dto/componenteEditar.dto';
import { ComponenteService } from './componente.service';
import { COMPONENTE_RELATIONS, SELECTED_COMPONENTE, SELECTED_COMPONENTE_BY_ID } from './default/relacion.default';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { RetornoGet } from '@src/base/interface/base.interface';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { parsearPaginado } from '@src/utils/paginado';

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
    @Query('pagina') paginaQuery: string | undefined,
    @Query('limite') limiteQuery: string | undefined,
  ): Promise<RetornoGet<typeof Entidad.COMPONENTE>> {
    const { pagina, limite, offset } = parsearPaginado(paginaQuery, limiteQuery);
    if (busqueda) {
      const retorno = await this.componenteService.buscarComponenteNombre({
        limite,
        offset,
        qR: req.queryRunner,
        busqueda
      });

      return {
        total: retorno.total,
        limite,
        pagina,
        datos: retorno.datos,
        query: busqueda ?? '',
      }
    }

    const retorno = await this.componenteService.getDatoCx({
      limite,
      offset,
      qR: req.queryRunner
    });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos,
      query: busqueda ?? '',
    }
  }
}