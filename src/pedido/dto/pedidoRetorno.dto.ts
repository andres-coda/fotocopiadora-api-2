import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { DtoClienteRespuesta } from "../../cliente/dto/clienteRespuesta.dto";
import { Estado } from "../../interface/estado.interface";
import { DtoLibroPedidoRespuesta } from "../../libro_pedido/dto/libroPedidoRetorno.dto";

export class DtoPedidoRespuestaCliente extends DtoBaseRetorno {
  fechaEntrega!: string;
  importeTotal!: number;
  archivos!: number;
  anillados!: number;
  estado!: Estado; 
  sena!: number;
  libroPedidos!: DtoLibroPedidoRespuesta[];
}

export class DtoPedidoRespuesta extends DtoPedidoRespuestaCliente {
  cliente!: DtoClienteRespuesta;
}