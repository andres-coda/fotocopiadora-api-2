import { Body, Controller, Delete, Get, HttpCode, Param, Put, Query, Request, UseGuards } from '@nestjs/common';
import { DtoPrecioEditar, DtoPrecioRespuesta } from './dto/precio.dto';
import { PrecioService } from './precio.service';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { RetornoGenericoControllerGet, UpdateGenericoProp } from '@src/interface/general.interface';
import { SuperAdminGuard } from '@src/auth/guard/superAdmin.guard';

@Controller('precio')
@UseGuards(SuperAdminGuard)
export class PrecioController {
  constructor(
    protected readonly precioService: PrecioService,
  ) { }
  @Get()
  @HttpCode(200)
  async findAll(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<DtoPrecioRespuesta>> {
    const offset = (pagina - 1) * limite;
    const retorno = await this.precioService.getDatos({
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
  async softDeleteConstante(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    return this.precioService.deletePrecio({id, qR:req.queryRunner});
  }

  @Put(':id')
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