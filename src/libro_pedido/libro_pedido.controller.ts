import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { LIBRO_PEDIDO_RELATIONS, SELECTED_LIBRO_PEDIDO } from './default/relacion.default';
import { LibroPedido } from './entity/libroPedido.entity';
import { DtoLibroPedidoCrear } from './dto/DtoCrearLibroPedido.dto';
import { DtoLibroPedidoEditar } from './dto/DtoEditarLibroPedido.dto';
import { LibroPedidoService } from './libro_pedido.service';
import { DtoCambiarEstado } from './dto/DtoCambiarEstado.dto';
import { User } from '@src/user/entity/user.entity';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { AdminGuard } from '@src/auth/guard/admin.guard';
import { UsuarioCompleto } from '@src/utils/usuarioActual.decorador';
import { EditarElementoControllerProp } from '@src/base/interface/base.interface';

@Controller('libro-pedido')
export class LibroPedidoController extends BaseController<typeof Entidad.LIBRO_PEDIDO,LibroPedido, DtoLibroPedidoCrear, DtoLibroPedidoEditar> {
  constructor(
    protected readonly libroPedidoService: LibroPedidoService,
  ) {
    super(libroPedidoService, Entidad.LIBRO_PEDIDO, Entidad.LIBRO_PEDIDO, [LIBRO_PEDIDO_RELATIONS], 'cantidad', SELECTED_LIBRO_PEDIDO)
  }
  @Patch(':id')
  @UseGuards(UsuarioGuard, AdminGuard)
  async cambiarEstado(
    @Param('id') id: string,
    @UsuarioCompleto() user: User,
    @Body() datos: DtoCambiarEstado
  ): Promise<boolean> {
    const dto: EditarElementoControllerProp<LibroPedido, DtoCambiarEstado, typeof Entidad.LIBRO_PEDIDO> = {
      dto: datos,
      usuario: user,
      entidad: this.entidad,
      id: id,
      usuarioId:user.id
    }
    const retorno: LibroPedido = await this.libroPedidoService.cambiarEstadoCx(dto);
    return retorno ? true : false;
  }

}