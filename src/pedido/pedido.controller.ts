import { Controller } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { PedidoService } from './pedido.service';
import { Pedido } from './entity/pedido.entity';
import { DtoPedidoCrear } from './dto/pedidoCrear.dto';
import { DtoPedidoEditar } from './dto/pedidoEditar.dto';
import { PEDIDO_RELATIONS, PEDIDO_SELECTED } from './default/relacion';

@Controller('pedido')
export class PedidoController extends BaseController<Pedido, DtoPedidoCrear, DtoPedidoEditar> {
  constructor(
    protected readonly pedidoService: PedidoService,
  ) {
    super(pedidoService, Entidad.PEDIDO, 'pedido', [PEDIDO_RELATIONS], 'fechaEntrega', PEDIDO_SELECTED)
  }
}