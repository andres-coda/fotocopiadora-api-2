import { Controller, Get, HttpCode, Query, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { PedidoService } from './pedido.service';
import { Pedido } from './entity/pedido.entity';
import { DtoPedidoCrear, DtoPedidoEditar } from './dto/pedido.dto';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { DtoPedidoItemRespuesta } from '@src/libro_pedido/dto/pedido_item.dto';

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
    super(pedidoService, Entidad.PEDIDO, 'pedido', [], 'fechaEntrega');
  }

  /**
   * Búsqueda de pedidos con filtro opcional de estado y paginado.
   * GET /pedido/buscar?q=juan&estado=1&limite=20&pagina=1
   */

  @Get('buscar')
  @HttpCode(200)
  async buscar(
    @Query('q') busqueda = '',
    @Query('estado') estado: number | undefined,
    @Query('limite') limite = 20,
    @Query('pagina') pagina = 1,
    @Request() req: RequestWithUser,
  ): Promise<DtoPedidoItemRespuesta[]> {
    const offset = (Number(pagina) - 1) * Number(limite);
    return this.pedidoService.buscarPedidos(
      busqueda,
      estado ? Number(estado) : null,
      Number(limite),
      offset,
      req.queryRunner,
    );
  }
}