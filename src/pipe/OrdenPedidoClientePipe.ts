import { Injectable, PipeTransform } from '@nestjs/common';
import { OrdenPedidoCliente } from '@src/cliente/interface/cliente_retorno.interface';

@Injectable()
export class OrdenPedidoClientePipe
  implements PipeTransform<string, OrdenPedidoCliente>
{
  transform(value: string): OrdenPedidoCliente {
    if (
      Object.values(OrdenPedidoCliente).includes(
        value as OrdenPedidoCliente,
      )
    ) {
      return value as OrdenPedidoCliente;
    }

    return OrdenPedidoCliente.ESTADO_PEDIDO;
  }
}