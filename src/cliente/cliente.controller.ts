import { Controller } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Cliente } from './entity/cliente.entity';
import { DtoClienteCrear } from './dto/clienteCrear.dto';
import { DtoClienteEditar } from './dto/clienteEditar.dto';
import { ClienteService } from './cliente.service';
import { CLIENTE_RELATIONS, CLIENTE_SELECTED, CLIENTE_SELECTED_BY_ID } from './default/relacion';
import { DtoClienteRespuesta } from './dto/clienteRespuesta.dto';

@Controller('cliente')
export class ClienteController extends BaseController<typeof Entidad.CLIENTE,Cliente, DtoClienteCrear, DtoClienteEditar, ClienteService> {
  constructor(
    protected readonly clienteService: ClienteService,
  ) {
    super(clienteService, Entidad.CLIENTE, 'cliente', [CLIENTE_RELATIONS], 'telefono', CLIENTE_SELECTED_BY_ID, undefined, CLIENTE_SELECTED)
  }
}

