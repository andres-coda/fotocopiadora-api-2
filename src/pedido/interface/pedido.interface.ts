import { GenericoProp } from "@src/base/interface/base.interface";
import { Estado } from "@src/interface/estado.interface";

export interface GetPedidoXLibro extends GenericoProp {
  estado:Estado,
  id_libro: string
}