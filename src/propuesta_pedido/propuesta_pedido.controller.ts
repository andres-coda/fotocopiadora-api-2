import { Controller } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Propuesta } from './entity/propuesta_pedido.entity';
import { DtoPropuestaCrear } from './dto/propuesta_pedidoCrear.dto';
import { DtoPropuestaEditar } from './dto/propuesta_pedidoEditar.dto';
import { PropuestaService } from './propuesta_pedido.service';
import { PROPUESTA_RELATIONS, PROPUESTA_SELECTED } from './default/relacion';

@Controller('propuesta-pedido')
export class PropuestaPedidoController extends BaseController<Propuesta, DtoPropuestaCrear, DtoPropuestaEditar> {
  constructor(
    protected readonly propuestaService: PropuestaService,
  ) {
    super(propuestaService, Entidad.PROPUESTA_PEDIDO, 'propuesta', [PROPUESTA_RELATIONS], 'nombre', PROPUESTA_SELECTED)
  }
}