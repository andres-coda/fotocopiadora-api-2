import { Body, Controller, Delete, HttpCode, Param, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { PedidoItemService } from './pedido_item.service';
import { DtoCambiarEstadoItem, DtoLibroPedidoCrear, DtoPedidoItemEditar, DtoPedidoItemRespuesta } from './dto/pedido_item.dto';
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';

@Controller('pedido/:idPedido/item')
@UseGuards(UsuarioGuard)
export class PedidoItemController {
  constructor(private readonly itemService: PedidoItemService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Param('idPedido') idPedido: string,
    @Body() dto: DtoLibroPedidoCrear,
    @Request() req: RequestWithUser,
  ): Promise<DtoPedidoItemRespuesta> {
    const item = await this.itemService.createItemCx(
      { ...dto, pedido_id: idPedido },
      req.queryRunner,
    );
    return item ;
  }

  @Put(':nroItem')
  @HttpCode(200)
  async update(
    @Param('idPedido') idPedido: string,
    @Param('nroItem') nroItem: number,
    @Body() dto: DtoPedidoItemEditar,
    @Request() req: RequestWithUser,
  ): Promise<DtoPedidoItemRespuesta> {
    return this.itemService.updateDatoCx({id_pedido:idPedido, nro_pedido:Number(nroItem), dto, qR:req.queryRunner});
  }

  @Patch(':nroItem/estado')
  @HttpCode(200)
  async cambiarEstado(
    @Param('idPedido') idPedido: string,
    @Param('nroItem') nroItem: number,
    @Body() dto: DtoCambiarEstadoItem,
    @Request() req: RequestWithUser,
  ): Promise<DtoPedidoItemRespuesta> {
    return this.itemService.cambiarEstadoCx({id_pedido:idPedido, nro_pedido:Number(nroItem), estado:dto.estado, qR:req.queryRunner});
  }

  @Delete(':nroItem')
  @HttpCode(200)
  async delete(
    @Param('idPedido') idPedido: string,
    @Param('nroItem') nroItem: number,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    return this.itemService.deleteItem({id_pedido:idPedido, nro_pedido:Number(nroItem), qR:req.queryRunner});
  }
}