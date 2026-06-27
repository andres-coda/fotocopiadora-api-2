import { Controller, Get, HttpCode, Query, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Cliente } from './entity/cliente.entity';
import { DtoClienteCrear, DtoClienteEditar, DtoClienteRespuesta } from './dto/cliente.dto';
import { ClienteService } from './cliente.service';
import { CLIENTE_RELATIONS, CLIENTE_X_RESUMEN_SELECTED} from './default/relacion';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type{ RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';


@Controller('cliente')
@UseGuards(UsuarioGuard)
export class ClienteController extends BaseController<typeof Entidad.CLIENTE, Cliente, DtoClienteCrear, DtoClienteEditar, ClienteService> {
  constructor(
    protected readonly clienteService: ClienteService,
  ) {
    super(clienteService, Entidad.CLIENTE, 'cliente', [CLIENTE_RELATIONS], 'telefono', CLIENTE_X_RESUMEN_SELECTED, [CLIENTE_RELATIONS], CLIENTE_X_RESUMEN_SELECTED)
  }

  /**
   * Búsqueda flexible de clientes usando fc_busqueda_cliente().
   * GET /cliente/buscar?q=juan&limite=20&pagina=1
   *
   * La función de la BD detecta automáticamente si busca por nombre o teléfono.
   * El RLS filtra automáticamente por empresa.
   */

  @Get('buscar')
  @HttpCode(200)
  async buscar(
    @Query('q') busqueda: string,
    @Query('limite') limite = 20,
    @Query('pagina') pagina = 1,
    @Request() req: RequestWithUser,
  ): Promise<DtoClienteRespuesta[]> {
    const offset = (pagina - 1) * limite;
    return this.clienteService.buscarClientes(
      busqueda,
      Number(limite),
      Number(offset),
      req.queryRunner,
    );
  }

}

