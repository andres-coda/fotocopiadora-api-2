import { Controller, Get, HttpCode, Query, Request, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { RetornoGenericoControllerGet } from '@src/interface/general.interface';
import { PrecioCategoria } from './entity/precio_categoria.entity';
import { PrecioCategoriaService } from './precio_categoria.service';

@Controller('precio-categoria')
@UseGuards(UsuarioGuard)
export class PrecioCategoriaController {
  constructor(private readonly precioCategoriaService: PrecioCategoriaService) { }

  @Get()
  @HttpCode(200)
  async getAll(
    @Query('q') busqueda: string,
    @Query('pagina') pg = 1,
    @Query('limite') limite = 20,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<PrecioCategoria>> {
    const pagina: number = Number(pg) > 0 ? Number(pg) : 1;
    const offset = (pagina - 1) * Number(limite);

    const retorno = await this.precioCategoriaService.getCategorias({
      qR: req.queryRunner,
      limite: Number(limite),
      offset,
      busqueda
    });

    return {
      total: retorno.total,
      limite: Number(limite),
      pagina,
      datos: retorno.datos
    }
  }
}
