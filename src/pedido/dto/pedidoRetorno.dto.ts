import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";
import { DtoClienteRespuesta } from "@src/cliente/dto/clienteRespuesta.dto";
import { DtoLibroPedidoRespuesta } from "@src/libro_pedido/dto/libroPedidoRetorno.dto";

export class DtoPedidoRespuesta extends DtoBaseRetorno {
  fechaEntrega!: string;
  importeTotal!: number;
  archivos!: number;
  anillados!: number;
  sena!: number;
  cliente!: DtoClienteRespuesta;
  libroPedidos!: DtoLibroPedidoRespuesta[];
}