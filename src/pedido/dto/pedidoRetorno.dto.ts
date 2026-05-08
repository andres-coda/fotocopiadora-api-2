import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { DtoClienteRespuesta } from "../../cliente/dto/clienteRespuesta.dto";
import { DtoLibroPedidoRespuesta } from "../../libro_pedido/dto/libroPedidoRetorno.dto";

export class DtoPedidoRespuesta extends DtoBaseRetorno {
  fechaEntrega!: string;
  importeTotal!: number;
  archivos!: number;
  anillados!: number;
  sena!: number;
  cliente!: DtoClienteRespuesta;
  libroPedidos!: DtoLibroPedidoRespuesta[];
}