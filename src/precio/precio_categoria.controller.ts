import { Controller, Get, HttpCode, Query, Request, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { RetornoGenericoControllerGet } from '@src/interface/general.interface';
import { PrecioCategoria } from './entity/precio_categoria.entity';
import { PrecioCategoriaService } from './precio_categoria.service';
import type { PrecioCategoriaUsoRetornoProp } from './retorno/precio.retorno';
import { parsearPaginado } from '@src/utils/paginado';

@Controller('precio-categoria')
@UseGuards(UsuarioGuard)
export class PrecioCategoriaController {
  constructor(private readonly precioCategoriaService: PrecioCategoriaService) { }

  /**
   * Todas las categorias visibles para la empresa, con `usada` para que el
   * front separe las bloqueadas (lateral) de las usadas (modal de filtros).
   */
  @Get('todas')
  @HttpCode(200)
  async getAllCategorias(
    @Request() req: RequestWithUser,
  ): Promise<PrecioCategoriaUsoRetornoProp[]> {
    return this.precioCategoriaService.getCategoriasConUso({ qR: req.queryRunner });
  }

  @Get()
  @HttpCode(200)
  async getAll(
    @Query('q') busqueda: string,
    @Query('pagina') paginaQuery: string | undefined,
    @Query('limite') limiteQuery: string | undefined,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<PrecioCategoria>> {
    const { pagina, limite, offset } = parsearPaginado(paginaQuery, limiteQuery);

    const retorno = await this.precioCategoriaService.getCategorias({
      qR: req.queryRunner,
      limite,
      offset,
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
}
