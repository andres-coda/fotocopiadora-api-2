import { GenericoProp } from "@src/base/interface/base.interface";
import { Estado } from "@src/interface/estado.interface";
import { EstadoPedido } from "./estadoPedido.enum";
import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";

export interface GetPedidoXLibro extends GenericoProp {
  estado:Estado,
  id_libro: string
}

export interface GetPedidoBusqueda extends DtoBaseRetorno{
  fecha_entrega:Date;
  importe_total:number;
  sena: number;
  delete:boolean;
  archivos:number;
  anillados:number;
  estado:EstadoPedido;
  telefono: string;
  email:string;
  nombre:string;
  id_cliente:string;
  delete_cliente: boolean;
}