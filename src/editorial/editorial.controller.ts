import { Controller, Get, HttpCode, Query, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Editorial } from './entity/editorial.entity';
import { DtoEditorialCrear, DtoEditorialEditar } from './dto/editorial.dto';
import { EDITORIAL_RELATIONS, SELECTED_EDITORIAL } from './default/editorial.default';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { RetornoGet } from '@src/base/interface/base.interface';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { EditorialService } from './editorial.service';
import { parsearPaginado } from '@src/utils/paginado';

@Controller('editorial')
@UseGuards(UsuarioGuard)
export class EditorialController extends BaseController<typeof Entidad.EDITORIAL, Editorial, DtoEditorialCrear, DtoEditorialEditar, EditorialService> {
  constructor(
    protected readonly editorialService: EditorialService,
  ) {
    super(editorialService, Entidad.EDITORIAL, 'editorial', [EDITORIAL_RELATIONS], 'nombre', SELECTED_EDITORIAL, undefined, SELECTED_EDITORIAL)
  }

  @Get()
  @HttpCode(200)
  async buscarEditorial(
    @Request() req: RequestWithUser,
    @Query('q') busqueda: string,
    @Query('pagina') paginaQuery: string | undefined,
    @Query('limite') limiteQuery: string | undefined,
  ): Promise<RetornoGet<typeof Entidad.EDITORIAL>> {
    const { pagina, limite, offset } = parsearPaginado(paginaQuery, limiteQuery);
    if (busqueda) {
      const retorno = await this.editorialService.buscarEditorialNombre({
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

    const retorno = await this.editorialService.getDatoCx({
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