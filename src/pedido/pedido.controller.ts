import { Body, Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { PedidoService } from './pedido.service';
import { Pedido } from './entity/pedido.entity';
import { DtoPedidoCrear } from './dto/pedidoCrear.dto';
import { DtoPedidoEditar } from './dto/pedidoEditar.dto';
import { PEDIDO_RELATIONS, PEDIDO_RELATIONS_BY_ID, PEDIDO_SELECTED, PEDIDO_SELECTED_BY_ID } from './default/relacion';
import { UsuarioActual } from '@src/utils/usuarioActual.decorador';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { AdminGuard } from '@src/auth/guard/admin.guard';
import { AuthParcialDto } from '@src/auth/dto/authParcial.dto';
import { Estado } from '@src/interface/estado.interface';
import { GetPedidoXLibro } from './interface/pedido.interface';
import { DtoPedidoXLibro } from './dto/pedidoXlibro.dto';

@Controller('pedido')
export class PedidoController extends BaseController<typeof Entidad.PEDIDO, Pedido, DtoPedidoCrear, DtoPedidoEditar, PedidoService> {
  constructor(
    protected readonly pedidoService: PedidoService,
  ) {
    super(pedidoService, Entidad.PEDIDO, 'pedido', [PEDIDO_RELATIONS_BY_ID], 'fechaEntrega', PEDIDO_SELECTED_BY_ID, [PEDIDO_RELATIONS], PEDIDO_SELECTED)
  }

  @Get('libro/:id')
  @HttpCode(200)
  @UseGuards(UsuarioGuard, AdminGuard)
  async findAllPedidoXLibro(
    @UsuarioActual() user: AuthParcialDto,
    @Param('id') id: string,
    @Body() estado: DtoPedidoXLibro
  ): Promise<Pedido[]> {
    const dto:GetPedidoXLibro = {
      id_libro: id,
      estado:estado.estado,
      usuarioId: user.sub,
    }
    return await this.pedidoService.getDatoXLibro(dto);
  }
}