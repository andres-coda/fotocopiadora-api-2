import { Body, Controller, Get, HttpCode, Query, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Cliente } from './entity/cliente.entity';
import { DtoClienteCrear, DtoClienteEditar, DtoClienteRespuesta } from './dto/cliente.dto';
import { ClienteService } from './cliente.service';
import { CLIENTE_RELATIONS, CLIENTE_X_RESUMEN_SELECTED } from './default/relacion';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { RetornoGenericoControllerGet } from '@src/interface/general.interface';


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

  @Get()
  @HttpCode(200)
  async buscar(
    @Query('q') busqueda: string | undefined,
    @Query('limite') limite = 20,
    @Query('pagina') pagDto = 1,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<DtoClienteRespuesta>> {
    const pagina = Number(pagDto) > 0 ? Number(pagDto) : 1;
    const offset = (pagina - 1) * limite;
    if (!busqueda || busqueda.length < 4) {
      const datoRetorno = await this.baseService.getDatoCx({
        entidadError: this.entidadError,
        relaciones: this.relacionesGenerales ?? this.relaciones,
        selected: this.selectedGeneral ?? this.selected,
        orden: this.orden,
        limite,
        offset,
        qR: req.queryRunner
      });

      return datoRetorno
    }

    const retorno = await this.clienteService.buscarClientes(
      busqueda,
      Number(limite),
      Number(offset),
      req.queryRunner,
    );

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos
    }
  }

}

