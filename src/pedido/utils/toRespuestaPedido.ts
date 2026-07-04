import { DtoPedidoItemRespuesta } from "../../pedido_item/dto/pedido_item.dto";
import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { toRespuestaBase } from "../../utils/toRespuesta.function";
import { DtoPedidoRespuesta } from "../dto/pedido.dto";
import { Pedido } from "../entity/pedido.entity";
import { DtoClienteRespuesta } from "../../cliente/dto/cliente.dto";
import { toRespuestaCliente } from "../../cliente/utils/toRespuestaCliente";
import { toRespuestaPedidoItem } from "../../pedido_item/utils/toRespuestaItem";

export const toRespuestaPedido = (dato?: Pedido): DtoPedidoRespuesta | undefined => {
  if (!dato) return undefined;
  const base: DtoBaseRetorno | undefined = toRespuestaBase<Pedido | undefined>(dato);
  if (!base) return undefined;
  const pedidoItems: DtoPedidoItemRespuesta[] = (dato.pedidoItems ?? [])
    .flatMap(e => {
      const esp = toRespuestaPedidoItem(e);
      return esp ? [esp] : [];
    });

  const cliente: DtoClienteRespuesta | undefined = toRespuestaCliente(dato.cliente);

  return {
    ...base,
    fechaEntrega: dato.fechaEntrega,
    importeTotal: dato.importeTotal,
    archivos: dato.archivos,
    anillados: dato.anillados,
    sena: dato.sena,
    estado: dato.estado,
    cliente,
    items: pedidoItems,
  }
}