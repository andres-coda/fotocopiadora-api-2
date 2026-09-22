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
    @Query('pagina') pg = 1,
    @Query('limite') limite = 20,
  ): Promise<RetornoGet<typeof Entidad.EDITORIAL>> {
    const pagina: number = pg > 0 ? Number(pg) : 1;
    const offset = (Number(pagina) - 1) * Number(limite);
    if (busqueda) {
      const retorno = await this.editorialService.buscarEditorialNombre({
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

    const retorno = await this.editorialService.getDatoCx({
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