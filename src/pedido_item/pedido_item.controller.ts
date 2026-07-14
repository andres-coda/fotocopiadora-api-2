import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { PedidoItemService } from './pedido_item.service';
import { DtoCambiarEstadoItem, DtoLibroPedidoCrear, DtoPedidoItemEditar, DtoPedidoItemRespuesta } from './dto/pedido_item.dto';
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';
import { RetornoGenericoControllerGet } from '@src/interface/general.interface';

export enum OrdenPedidoItem {
  ESTADO = 'estado',
  FECHA_CREACION = 'fecha_creacion',
  ENTREGA = 'fecha_entrega',
}

@Controller('item')
@UseGuards(UsuarioGuard)
export class PedidoItemController {
  constructor(private readonly itemService: PedidoItemService) { }

  @Get()
  @HttpCode(200)
  async getItems(
    @Request() req: RequestWithUser,
    @Query('limite') limite = 20,
    @Query('pagina') pagina = 1,
    @Query('orden') orden: OrdenPedidoItem = OrdenPedidoItem.ESTADO
  ): Promise<RetornoGenericoControllerGet<DtoPedidoItemRespuesta>> {

    const offset = (Number(pagina) - 1) * Number(limite);
    const items = await this.itemService.getItems({
      limite: Number(limite),
      offset,
      qR: req.queryRunner,
      orden
    });

    return {
      total: items.total,
      limite,
      pagina,
      datos: items.datos
    }
  }



  @Get('/:idPedido/pedido')
  @HttpCode(200)
  async getItemsByPedido(
    @Param('idPedido') idPedido: string,
    @Request() req: RequestWithUser,
    @Query('limite') limite = 20,
    @Query('pagina') pagina = 1,
  ): Promise<RetornoGenericoControllerGet<DtoPedidoItemRespuesta>> {
    const id_empresa = req.user.idEmpresa;
    if(!id_empresa) throw new NotFoundException('No puede acceder a los pedidos porque no pertenece a ninguna empresa')
    const offset = (Number(pagina) - 1) * Number(limite);
    const items = await this.itemService.getItemByPedido({
      limite: Number(limite),
      id_pedido: idPedido,
      offset,
      qR: req.queryRunner,
      id_empresa
    });

    return {
      total:items.total,
      limite,
      pagina,
      datos:items.datos
    };
  }

  @Get('/:idLibro/libro')
  @HttpCode(200)
  async getItemsByLibro(
    @Param('idLibro') idLibro: string,
    @Request() req: RequestWithUser,
    @Query('limite') limite = 20,
    @Query('pagina') pagina = 1,
  ): Promise<RetornoGenericoControllerGet<DtoPedidoItemRespuesta>> {
    const id_empresa = req.user.idEmpresa;
    if(!id_empresa) throw new NotFoundException('No puede acceder a los pedidos porque no pertenece a ninguna empresa')
    const offset = (Number(pagina) - 1) * Number(limite);
    const items = await this.itemService.getItemsPedidoByLibroId({
      limite: Number(limite),
      id_libro: idLibro,
      offset,
      qR: req.queryRunner,
      id_empresa
    });

    return {
      total:items.total,
      limite,
      pagina,
      datos:items.datos
    };
  }

  @Post('/:idPedido/pedido')
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
    return item;
  }

  @Put('/:idPedido/pedido/:nroItem')
  @HttpCode(200)
  async update(
    @Param('idPedido') idPedido: string,
    @Param('nroItem') nroItem: number,
    @Body() dto: DtoPedidoItemEditar,
    @Request() req: RequestWithUser,
  ): Promise<DtoPedidoItemRespuesta> {
    return this.itemService.updateDatoCx({ id_pedido: idPedido, nro_pedido: Number(nroItem), dto, qR: req.queryRunner });
  }

  @Patch('/:idPedido/pedido:nroItem/estado')
  @HttpCode(200)
  async cambiarEstado(
    @Param('idPedido') idPedido: string,
    @Param('nroItem') nroItem: number,
    @Body() dto: DtoCambiarEstadoItem,
    @Request() req: RequestWithUser,
  ): Promise<DtoPedidoItemRespuesta> {
    return this.itemService.cambiarEstadoCx({ id_pedido: idPedido, nro_pedido: Number(nroItem), estado: dto.estado, qR: req.queryRunner });
  }

  @Delete('/:idPedido/pedido:nroItem')
  @HttpCode(200)
  async delete(
    @Param('idPedido') idPedido: string,
    @Param('nroItem') nroItem: number,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    return this.itemService.deleteItem({ id_pedido: idPedido, nro_pedido: Number(nroItem), qR: req.queryRunner });
  }
}