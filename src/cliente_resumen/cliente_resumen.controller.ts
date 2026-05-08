import { Controller } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { ClienteResumen } from './entity/clienteResumen.entity';
import { DtoResumenCrear } from './dto/clienteResumenCrear.dto';
import { DtoResumenEditar } from './dto/clienteResumenEditar.dto';
import { ClienteResumenService } from './cliente_resumen.service';
import { DtoResumenRespuesta } from './dto/clienteResumenRespuesta.dto';

@Controller('cliente-resumen')
export class ClienteResumenController extends BaseController<typeof Entidad.RESUMEN, ClienteResumen, DtoResumenCrear, DtoResumenEditar, DtoResumenRespuesta, ClienteResumenService> {
  constructor(
    protected readonly resumenService: ClienteResumenService,
  ) {
    super(resumenService, Entidad.RESUMEN, 'resumen', undefined, undefined, undefined)
  }
}