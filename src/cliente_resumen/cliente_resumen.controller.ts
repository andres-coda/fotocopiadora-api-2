import { Controller } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { ClienteResumen } from './entity/clienteResumen.entity';
import { DtoResumenCrear } from './dto/clienteResumenCrear.dto';
import { DtoResumenEditar } from './dto/clienteResumenEditar.dto';
import { ClienteResumenService } from './cliente_resumen.service';

@Controller('cliente-resumen')
export class ClienteResumenController extends BaseController<typeof Entidad.RESUMEN, ClienteResumen, DtoResumenCrear, DtoResumenEditar> {
  constructor(
    protected readonly resumenService: ClienteResumenService,
  ) {
    super(resumenService, Entidad.RESUMEN, 'resumen', undefined, undefined, undefined)
  }
}