import { Body, Controller, Delete, Get, HttpCode, Param, Put, Query, Request, UseGuards } from '@nestjs/common';
import { DtoPrecioEditar, DtoPrecioRespuesta } from './dto/precio.dto';
import { PrecioService } from './precio.service';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { RetornoGenericoControllerGet, UpdateGenericoProp } from '@src/interface/general.interface';
import { SuperAdminGuard } from '@src/auth/guard/superAdmin.guard';
import { UsuarioGuard } from '@src/auth/guard/user.guard';

@Controller('precio')
@UseGuards(UsuarioGuard)
export class PrecioController {
  constructor(
    protected readonly precioService: PrecioService,
  ) { }
  @Get()
  @HttpCode(200)
  async findAll(
    @Query('q') busqueda: string,
    @Query('pagina') pg = 1,
    @Query('limite') limite = 20,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<DtoPrecioRespuesta> | undefined> {
    const pagina: number = pg > 0 ? Number(pg) : 1;
    const offset = (Number(pagina) - 1) * Number(limite);

    if (!busqueda || busqueda.length < 3) return undefined;

    const retorno = await this.precioService.getPreciosBusqueda({
      busqueda,
      limite,
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

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  async softDeleteConstante(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    return this.precioService.deletePrecio({ id, qR: req.queryRunner });
  }

  @Put(':id')
  @UseGuards(SuperAdminGuard)
  async updateDato(
    @Param('id') id: string,
    @Body() datos: DtoPrecioEditar,
    @Request() req: RequestWithUser,
  ): Promise<DtoPrecioRespuesta> {
    const dto: UpdateGenericoProp<DtoPrecioEditar> = {
      dto: datos,
      id,
      qR: req.queryRunner,
    };
    return this.precioService.updatePrecio(dto);
  }
}