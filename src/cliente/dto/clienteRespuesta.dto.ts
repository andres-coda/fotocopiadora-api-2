import { DtoPedidoRespuesta } from "@src/pedido/dto/pedidoRetorno.dto";
import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { DtoResumenRespuesta } from "../../cliente_resumen/dto/clienteResumenRespuesta.dto";

export class DtoClienteRespuesta extends DtoBaseRetorno{
  nombre?: string;
  telefono?: string;
  email?: string;  
  resumen?:DtoResumenRespuesta;
  pedidos?:DtoPedidoRespuesta[];
}