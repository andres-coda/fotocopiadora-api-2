import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '../auth/guard/user.guard';
import { AdminGuard } from '../auth/guard/admin.guard';
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';
import { RetornoGenericoControllerGet, RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { DatoCobroService } from './datoCobro.service';
import { DtoDatoCobroCrear } from './dto/datoCobroCrear.dto';
import { DtoDatoCobroEditar } from './dto/datoCobroEditar.dto';
import { DatoCobroRetorno } from './retorno/datoCobro.retorno';

/**
 * Endpoints de datos de cobro por empresa.
 * Escritura restringida a admin (AdminGuard); lectura para cualquier usuario.
 * El RLS filtra automaticamente los datos de la empresa del usuario.
 */
@Controller('dato-cobro')
@UseGuards(UsuarioGuard)
export class DatoCobroController {
  constructor(private readonly datoCobroService: DatoCobroService) { }

  @Get()
  @HttpCode(200)
  async getDatosCobro(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<DatoCobroRetorno>> {
    const offset = (pagina - 1) * limite;

    const retorno: RetornoGenericoServiceGet<DatoCobroRetorno> = await this.datoCobroService.getDatosCobro({
      qR: req.queryRunner,
      limite,
      offset,
    });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos,
    };
  }

  /**
   * Busqueda paginada por nombre (ILIKE) para alimentar desplegables del front.
   * Se declara antes de ':id' para que la ruta fija no sea capturada por el parametro.
   * Sin 'q' devuelve el listado paginado completo.
   */
  @Get('nombre')
  @HttpCode(200)
  async buscarDatoCobro(
    @Request() req: RequestWithUser,
    @Query('q') busqueda: string,
    @Query('pagina') pg = 1,
    @Query('limite') limite = 20,
  ): Promise<RetornoGenericoControllerGet<DatoCobroRetorno>> {
    const pagina: number = pg > 0 ? Number(pg) : 1;
    const offset = (Number(pagina) - 1) * Number(limite);

    const retorno: RetornoGenericoServiceGet<DatoCobroRetorno> = busqueda
      ? await this.datoCobroService.buscarDatoCobroNombre({
        qR: req.queryRunner,
        limite: Number(limite),
        offset,
        busqueda,
      })
      : await this.datoCobroService.getDatosCobro({
        qR: req.queryRunner,
        limite: Number(limite),
        offset,
      });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos,
    };
  }

  @Get(':id')
  @HttpCode(200)
  async getDatoCobroById(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<DatoCobroRetorno> {
    return this.datoCobroService.getDatoCobroByIdOrFail(req.queryRunner, id);
  }

  @Post()
  @UseGuards(AdminGuard)
  async createDatoCobro(
    @Body() datos: DtoDatoCobroCrear,
    @Request() req: RequestWithUser,
  ): Promise<DatoCobroRetorno> {
    return this.datoCobroService.createDatoCobro(req.queryRunner, datos, req.user.idEmpresa);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async updateDatoCobro(
    @Param('id') id: string,
    @Body() datos: DtoDatoCobroEditar,
    @Request() req: RequestWithUser,
  ): Promise<DatoCobroRetorno> {
    return this.datoCobroService.updateDatoCobro(req.queryRunner, id, datos);
  }

  /**
   * Elimina un dato de cobro de forma fisica.
   * Devuelve un body JSON (true) para que el front pueda hacer res.json().
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteDatoCobro(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    return this.datoCobroService.deleteDatoCobro(req.queryRunner, id);
  }
}
