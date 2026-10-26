import { Body, Controller, DefaultValuePipe, Get, HttpCode, Param, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { PedidoService } from './pedido.service';
import { Pedido } from './entity/pedido.entity';
import { DtoPedidoCambioEstadoRespuesta, DtoPedidoCrear, DtoPedidoEditar, DtoPedidoRespuestaCliente } from './dto/pedido.dto';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { DtoCambiarEstadoItem, DtoPedidoItemRespuesta } from '@src/pedido_item/dto/pedido_item.dto';
import { PEDIDO_RELATIONS, PEDIDO_SELECTED } from './default/relacion';
import { RetornoGenericoControllerGet } from '@src/interface/general.interface';
import { EstadoPedido } from './interface/estadoPedido.enum';
import { OrdenPedidoCliente } from '@src/cliente/interface/cliente_retorno.interface';
import { OrdenPedidoClientePipe } from '@src/pipe/OrdenPedidoClientePipe';
import { PedidoRetorno } from './retorno/pedido.retorno';
import { ItemRetorno } from '@src/pedido_item/retorno/item.retorno';

const aArreglo = (valor?: string | string[]): string[] => {
  if (valor === undefined || valor === null) return [];
  return Array.isArray(valor) ? valor : [valor];
};

const normalizarEstados = (valor?: string | string[]): number[] =>
  aArreglo(valor).map(e => Number(e)).filter(e => Number.isInteger(e) && e > 0);

const normalizarTexto = (valor?: string | string[]): string[] =>
  aArreglo(valor).map(v => v.trim()).filter(v => v.length > 0);

const normalizarFecha = (valor?: string): string | null => {
  if (!valor) return null;
  const limpio = valor.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(limpio) ? limpio : null;
};

@Controller('pedido')
@UseGuards(UsuarioGuard)
export class PedidoController extends BaseController<
  typeof Entidad.PEDIDO,
  Pedido,
  DtoPedidoCrear,
  DtoPedidoEditar,
  PedidoService
> {
  constructor(protected readonly pedidoService: PedidoService) {
    super(pedidoService, Entidad.PEDIDO, 'pedido', [PEDIDO_RELATIONS], 'fechaEntrega', PEDIDO_SELECTED);
  }

  /**
   * Búsqueda de pedidos con filtros opcionales y paginado.
   * GET /pedido/buscar?q=juan&estado=1&estado=4&especificacion=color&entrega=2026-10-30&tomado=2026-10-20&limite=6&pagina=1&orden=fechaEntrega:asc&orden=cliente:desc
   */

  @Get('buscar')
  @HttpCode(200)
  async buscar(
    @Query('q') busqueda = '',
    @Query('estado') estado: string | string[] | undefined,
    @Query('especificacion') especificacion: string | string[] | undefined,
    @Query('entrega') entrega: string | undefined,
    @Query('tomado') tomado: string | undefined,
    @Query('orden') orden: string | string[] | undefined,
    @Query('limite') limite = '20',
    @Query('pagina') pg = '1',
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<ItemRetorno>> {
    const pagina = Number(pg) > 0 ? Number(pg) : 1;
    const limiteNum = Number(limite) > 0 ? Number(limite) : 20;
    const offset = (pagina - 1) * limiteNum;

    const retorno = await this.pedidoService.buscarPedidos({
      busqueda,
      estados: normalizarEstados(estado),
      especificaciones: normalizarTexto(especificacion),
      entrega: normalizarFecha(entrega),
      tomado: normalizarFecha(tomado),
      orden: normalizarTexto(orden),
      limite: limiteNum,
      offset,
      qR: req.queryRunner,
    });

    return {
      ...retorno,
      limite: limiteNum,
      pagina,
    }
  }

  @Get('cliente/:id')
  @HttpCode(200)
  async buscarIdCliente(
    @Param('id') idCliente: string,
    @Query(
      'orden',
      new DefaultValuePipe(OrdenPedidoCliente.ESTADO_PEDIDO),
      OrdenPedidoClientePipe,
    )
    orden: OrdenPedidoCliente,
    @Query('limite') limite = 20,
    @Query('pagina') pg = 1,
    @Query('estado') estado: EstadoPedido | undefined = undefined,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<PedidoRetorno> | undefined> {
    const pagina: number = pg > 0 ? Number(pg) : 1;
    const offset = (Number(pagina) - 1) * Number(limite);
    const retorno = await this.pedidoService.buscarPedidosByCliente({
      idCliente,
      orden,
      limite,
      offset,
      qR: req.queryRunner,
      filtroEstado: estado
    });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos
    }
  }

  @Patch('estado/:idPedido')
  @HttpCode(200)
  async cambiarEstadoPedido(
    @Param('idPedido') idPedido: string,
    @Body() dto: DtoCambiarEstadoItem,
    @Request() req: RequestWithUser,
  ): Promise<PedidoRetorno> {
    const retorno = this.pedidoService.cambiarEstadoPedidoCx({ id: idPedido, estado: dto.estado, qR: req.queryRunner });

    return retorno;
  }
}