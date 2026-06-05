import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { DtoClienteRespuesta } from "../../cliente/dto/clienteRespuesta.dto";
import { Estado } from "../../interface/estado.interface";
import { DtoLibroPedidoRespuesta } from "../../libro_pedido/dto/libroPedidoRetorno.dto";
import { EstadoPedido } from "../interface/estadoPedido.enum";

export class DtoPedidoEstadoRespuesta extends DtoBaseRetorno {
  estado!: EstadoPedido; 
}

export class DtoPedidoRespuestaCliente extends DtoPedidoEstadoRespuesta {
  fechaEntrega!: string;
  importeTotal!: number;
  archivos!: number;
  anillados!: number;
  sena!: number;
  libroPedidos!: DtoLibroPedidoRespuesta[];
}

export class DtoPedidoRespuesta extends DtoPedidoRespuestaCliente {
  cliente!: DtoClienteRespuesta;
}
