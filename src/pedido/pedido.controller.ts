import { Controller, DefaultValuePipe, Get, HttpCode, Param, Query, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { PedidoService } from './pedido.service';
import { Pedido } from './entity/pedido.entity';
import { DtoPedidoCrear, DtoPedidoEditar, DtoPedidoRespuestaCliente } from './dto/pedido.dto';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { DtoPedidoItemRespuesta } from '@src/pedido_item/dto/pedido_item.dto';
import { PEDIDO_RELATIONS, PEDIDO_SELECTED } from './default/relacion';
import { RetornoGenericoControllerGet } from '@src/interface/general.interface';
import { EstadoPedido } from './interface/estadoPedido.enum';
import { OrdenPedidoCliente } from '@src/cliente/interface/cliente_retorno.interface';
import { OrdenPedidoClientePipe } from '@src/pipe/OrdenPedidoClientePipe';

@Controller('pedido')
@UseGuards(UsuarioGuard)
export class PedidoController extends BaseController<
  typeof Entidad.PEDIDO,
  Pedido,
  DtoPedidoCrear,
  DtoPedidoEditar,
  PedidoService
> {
  constructor(protected readonly pedidoService: PedidoService) {
    super(pedidoService, Entidad.PEDIDO, 'pedido', [PEDIDO_RELATIONS], 'fechaEntrega', PEDIDO_SELECTED);
  }

  /**
   * Búsqueda de pedidos con filtro opcional de estado y paginado.
   * GET /pedido/buscar?q=juan&estado=1&limite=20&pagina=1
   */

  @Get('buscar')
  @HttpCode(200)
  async buscar(
    @Query('q') busqueda = '',
    @Query('estado') estado: EstadoPedido | undefined,
    @Query('limite') limite = 20,
    @Query('pagina') pg = 1,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<DtoPedidoItemRespuesta> | undefined> {
    const pagina: number = pg > 0 ? Number(pg) : 1;
    const offset = (Number(pagina) - 1) * Number(limite);

    if (!busqueda || busqueda.length < 3) return undefined;

    const retorno = await this.pedidoService.buscarPedidos({
      busqueda,
      estado,
      limite,
      offset,
      qR:req.queryRunner,
    });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos
    }
  }

  @Get('cliente/:id')
  @HttpCode(200)
  async buscarIdCliente(
    @Param('id') idCliente: string,
    @Query(
          'orden',
          new DefaultValuePipe(OrdenPedidoCliente.ESTADO_PEDIDO),
          OrdenPedidoClientePipe,
        )
        orden: OrdenPedidoCliente,
    @Query('limite') limite = 20,
    @Query('pagina') pg = 1,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<DtoPedidoRespuestaCliente> | undefined> {
    const pagina: number = pg > 0 ? Number(pg) : 1;
    const offset = (Number(pagina) - 1) * Number(limite);
    const retorno = await this.pedidoService.buscarPedidosByCliente({
      idCliente,
      orden,
      limite,
      offset,
      qR:req.queryRunner,
    });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos
    }
  }
}