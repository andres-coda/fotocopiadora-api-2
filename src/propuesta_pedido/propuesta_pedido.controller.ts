import { Controller } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Propuesta } from './entity/propuesta_pedido.entity';
import { DtoPropuestaCrear } from './dto/propuesta_pedidoCrear.dto';
import { DtoPropuestaEditar } from './dto/propuesta_pedidoEditar.dto';
import { PropuestaService } from './propuesta_pedido.service';
import { PROPUESTA_RELATIONS, PROPUESTA_SELECTED } from './default/relacion';
import { DtoPropuestaRespuesta } from './dto/propuestaRetorno.dto';

@Controller('propuesta-pedido')
export class PropuestaPedidoController extends BaseController<typeof Entidad.PROPUESTA_PEDIDO, Propuesta, DtoPropuestaCrear, DtoPropuestaEditar, PropuestaService> {
  constructor(
    protected readonly propuestaService: PropuestaService,
  ) {
    super(propuestaService, Entidad.PROPUESTA_PEDIDO, 'propuesta', [PROPUESTA_RELATIONS], 'nombre', PROPUESTA_SELECTED)
  }
}