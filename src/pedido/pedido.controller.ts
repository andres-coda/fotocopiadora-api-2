import { Controller } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { PedidoService } from './pedido.service';
import { Pedido } from './entity/pedido.entity';
import { DtoPedidoCrear } from './dto/pedidoCrear.dto';
import { DtoPedidoEditar } from './dto/pedidoEditar.dto';
import { PEDIDO_RELATIONS, PEDIDO_SELECTED } from './default/relacion';
import { DtoPedidoRespuesta } from './dto/pedidoRetorno.dto';

@Controller('pedido')
export class PedidoController extends BaseController<typeof Entidad.PEDIDO, Pedido, DtoPedidoCrear, DtoPedidoEditar, DtoPedidoRespuesta, PedidoService> {
  constructor(
    protected readonly pedidoService: PedidoService,
  ) {
    super(pedidoService, Entidad.PEDIDO, 'pedido', [PEDIDO_RELATIONS], 'fechaEntrega', PEDIDO_SELECTED)
  }
}