import { EstadoPedido } from "@src/pedido/interface/estadoPedido.enum";
import { Especificaciones } from "./especificaciones.interface";

export interface GetPedidoItemBusqueda{
  id_pedido: string;
  nro_pedido: number;
  cantidad: number;
  detalles?: string;
  estado: EstadoPedido,
  especficaciones?: Especificaciones[],
  cantidad_pg: number,
  cantidad_adhesivos?: number;
  nombre:string;
  descripcion?: string;
  edicion?: number;
  anio?: string;
  nivel?: string;
  componentes: string;
  materia: string;
  editorial: string;
  pendiente:number;
  listo: number;
  retirado:number;
  cancelado: number;
  stock:number;
  fecha_creacion: Date;
  fecha_entrega: string;
  importe_total:number;
  sena: number;
  anillados:number;
  archivs:number;
  estado_pedido: EstadoPedido;
  telefono: string;
  email:string;
  id_cliente:string;
  sede: string;
  id_sede: string;
  id_libro: string;
  id_materia: string;
}

export interface RetornoVistaItemsPedidoLibroById{
  id_pedido:string;
  nro_pedido:number;
  id_libro: string;
  id_sede:string;
  cantidad:number;
  detalles:string;
  estado:EstadoPedido;
  estado_pedido:EstadoPedido;
  especificaciones:Especificaciones[];
  fecha_creacion:Date;
  fecha_entrega:string;
  importe_total: number;
  sena:number;
  anillados:number;
  archivos:number;
  sede:string
  telefono:string;
  email:string;
}