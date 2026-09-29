import { GenericoProp } from "@src/base/interface/base.interface";
import { Estado } from "@src/interface/estado.interface";
import { EstadoPedido } from "./estadoPedido.enum";
import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";
import { Especificaciones } from "@src/pedido_item/interface/especificaciones.interface";

export interface GetPedidoXLibro extends GenericoProp {
  estado: Estado,
  id_libro: string
}

export interface GetPedidoBusqueda extends DtoBaseRetorno {
  fecha_entrega: Date;
  importe_total: number;
  sena: number;
  delete: boolean;
  archivos: number;
  anillados: number;
  estado: EstadoPedido;
  telefono: string;
  email: string;
  nombre: string;
  id_cliente: string;
  delete_cliente: boolean;
}

export interface fc_crear_pedido_prop {
  id: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  deleted?: boolean;

  fechaEntrega: string;
  importeTotal: number;
  sena: number;
  archivos: number;
  anillados: number;
  estado: EstadoPedido;

  items: {
    id: number;
    cantidad: number;
    detalles?: string;
    estado: EstadoPedido;
    idLibro: string;
    idSede?: string;
    especificaciones?: Especificaciones[];
  }[]

  cliente?: {
    id: string;
    nombre?: string;
    telefono?: string;
    email?: string
  }
}

export interface fc_cambiar_estado_pedido_prop {
  id: string;
  estado:EstadoPedido;
  fecha_actualizacion: Date;
  
  id_cliente:string;
  retirado:number;
  listo:number;
  pendiente:number;
  cancelado:number;

  id_libro:string;
  id_empresa:string;
  nro_pedido:number;
  libro_retirado:number;
  libro_listo:number;
  libro_pendiente:number;
  libro_cancelado:number;
  stock_libro:number;
  estado_pedido: EstadoPedido;
}