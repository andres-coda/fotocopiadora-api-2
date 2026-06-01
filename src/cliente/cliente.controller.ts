import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Cliente } from './entity/cliente.entity';
import { DtoClienteCrear } from './dto/clienteCrear.dto';
import { DtoClienteEditar } from './dto/clienteEditar.dto';
import { ClienteService } from './cliente.service';
import { CLIENTE_RELATIONS, CLIENTE_RELATIONS_BY_ID, CLIENTE_SELECTED, CLIENTE_SELECTED_BY_ID } from './default/relacion';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { AdminGuard } from '@src/auth/guard/admin.guard';
import { UsuarioActual } from '@src/utils/usuarioActual.decorador';
import { AuthParcialDto } from '@src/auth/dto/authParcial.dto';
import { ClienteRetorno } from './interface/cliente_retorno.interface';

@Controller('cliente')
export class ClienteController extends BaseController<typeof Entidad.CLIENTE, Cliente, DtoClienteCrear, DtoClienteEditar, ClienteService> {
  constructor(
    protected readonly clienteService: ClienteService,
  ) {
    super(clienteService, Entidad.CLIENTE, 'cliente', [CLIENTE_RELATIONS_BY_ID], 'telefono', CLIENTE_SELECTED_BY_ID, [CLIENTE_RELATIONS], CLIENTE_SELECTED)
  }
}

