import { Estado } from "../../interface/estado.interface";
import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { DtoLibroRespuesta } from "../../libro/dto/libroRetorno.dto";
import { DtoSedeRespuesta } from "../../sede/dto/sedeRetorno.dto";
import { DtoEspecificaionRetorno } from "../../especificacion/dto/DtoEspecificacionRetorno.dto";
import { DtoStockRespuesta } from "@src/stock/dto/stockRetorno.dto";
import { DtoPedidoEstadoRespuesta } from "@src/pedido/dto/pedidoRetorno.dto";
import { DtoResumenRespuesta } from "@src/cliente_resumen/dto/clienteResumenRespuesta.dto";

export class DtoLibroPedidoRespuesta extends DtoBaseRetorno {
  cantidad?: number;
  detalles?: string;
  estado!: Estado;
  libro?: DtoLibroRespuesta;
  sede?: DtoSedeRespuesta;
  especificaciones?: DtoEspecificaionRetorno[];
}

export class DtoCambioEstadoLibroPedidoRespuesta extends DtoBaseRetorno {
  estado!: Estado;
  stock?: DtoStockRespuesta;
  pedido?: DtoPedidoEstadoRespuesta;
  resumen?: DtoResumenRespuesta;
}