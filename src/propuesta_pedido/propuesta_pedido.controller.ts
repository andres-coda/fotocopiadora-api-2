import { Body, Controller, Delete, Get, HttpCode, Param, Query, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Propuesta } from './entity/propuesta_pedido.entity';
import { DtoPropuestaCrear } from './dto/propuesta_pedidoCrear.dto';
import { DtoPropuestaEditar } from './dto/propuesta_pedidoEditar.dto';
import { PropuestaService } from './propuesta_pedido.service';
import { PROPUESTA_RELATIONS, PROPUESTA_SELECTED } from './default/relacion';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { DeletProp } from '@src/base/interface/base.interface';
import { RetornoGenericoControllerGet } from '@src/interface/general.interface';
import { DtoPropuestaRespuesta } from './dto/propuestaRetorno.dto';

interface IdLibrosProp {
  id_libros: string[]
}

@Controller('propuesta-pedido')
@UseGuards(UsuarioGuard)
export class PropuestaPedidoController extends BaseController<typeof Entidad.PROPUESTA_PEDIDO, Propuesta, DtoPropuestaCrear, DtoPropuestaEditar, PropuestaService> {
  constructor(
    protected readonly propuestaService: PropuestaService,
  ) {
    super(propuestaService, Entidad.PROPUESTA_PEDIDO, 'propuesta', [PROPUESTA_RELATIONS], 'nombre', PROPUESTA_SELECTED, [PROPUESTA_RELATIONS], PROPUESTA_SELECTED)
  }

  @Delete('quitar-libros/:id')
  async quitarLibros(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() datos: IdLibrosProp
  ): Promise<boolean> {
    return this.propuestaService.quitarLibro({ id, id_libros: datos.id_libros, qR: req.queryRunner });
  }

  @Get('buscar')
  @HttpCode(200)
  async buscar(
    @Query('q') busqueda: string | undefined,
    @Query('limite') limite = 20,
    @Query('pagina') pagDto = 1,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<DtoPropuestaRespuesta>> {
    const pagina = Number(pagDto) > 0 ? Number(pagDto) : 1;
    const offset = (pagina - 1) * limite;
    if (!busqueda || busqueda.length < 3) return {
      total: 0,
      limite,
      pagina,
      datos: []
    };

    const retorno = await this.propuestaService.buscarPropuesta({
      busqueda,
      limite: Number(limite),
      offset: Number(offset),
      qR: req.queryRunner,
    });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos
    }
  }
}