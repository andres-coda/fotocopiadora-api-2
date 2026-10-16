import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";
import { EstadoPedido } from "../interface/estadoPedido.enum";
import { ClienteRetorno, ClienteRetornoProp } from "@src/cliente/retorno/cliente.retorno";
import { ItemCambioEstadoRetornoProp, ItemRetorno, ItemRetornoProp } from "@src/pedido_item/retorno/item.retorno";
import { Especificacion } from "@src/especificacion/entity/especificacion.entity";
import { Especificaciones } from "@src/pedido_item/interface/especificaciones.interface";

export interface PedidoRetornoProp extends BaseRetornoProp {
  estado: EstadoPedido;
}

export interface PedidoParaClienteRetornoProp {
  fechaEntrega: string;
  importeTotal: number;
  archivos: number;
  anillados: number;
  sena: number;
}

interface ItemParaPedidoRetornoProp extends Omit<ItemRetornoProp, 'idPedido'> {
  especificaciones?: Especificaciones[];
  sede?: {
    id: string;
    nombre: string;
  }
  libro?: {
    id: string,
    nombre: string;
    descripcion?: string;
    edicion: string;
    anio?: string;
    nivel?: string;
    componentes?: string;
    materia: string;
    id_materia: string;
    editorial?: string;
  }
}

export class PedidoRetorno extends BaseRetorno {
  estado!: EstadoPedido;

  fechaEntrega?: string;
  importeTotal?: number;
  archivos?: number;
  anillados?: number;
  sena?: number;

  items!: ItemRetorno[];
  cliente?: ClienteRetorno;

  constructor({ id, fecha_actualizacion, fecha_creacion, deleted, estado }: PedidoRetornoProp) {
    super({ id, fecha_actualizacion, fecha_creacion, deleted })
    this.estado = estado;
    this.items = [];
  }

  public agregarDatosPedido({
    fechaEntrega, importeTotal, archivos, anillados, sena
  }: PedidoParaClienteRetornoProp) {
    this.fechaEntrega = fechaEntrega;
    this.importeTotal = importeTotal;
    this.archivos = archivos;
    this.anillados = anillados;
    this.sena = sena;
  };

  public agregarItemsCambioEstadoPedido({ id_libro, pendiente, listo, cancelado, retirado, stock }: ItemCambioEstadoRetornoProp, { id, fecha_actualizacion, fecha_creacion, deleted, estado }: ItemRetornoProp) {
    const item = new ItemRetorno({ id, fecha_actualizacion, fecha_creacion, deleted, estado, idPedido: this.id });
    item.cambioEstadoItemRetorno({ id_libro, pendiente, listo, cancelado, retirado, stock })
    this.items.push(item);
  }

  public agregarItem(item:ItemRetorno){
    this.items.push(item);
  }

  public agregarItemPedido({ id, fecha_actualizacion, fecha_creacion, deleted, estado, detalles, cantidad, especificaciones, sede, libro }: ItemParaPedidoRetornoProp) {
    const item = new ItemRetorno({ id, fecha_actualizacion, fecha_creacion, deleted, estado, idPedido: this.id, detalles, cantidad });
    item.agregarEspecificacionesItem({ especificaciones: especificaciones ?? [] });
    if (sede)
      item.agregarSedeItemRetorno({ ...sede });
    if (libro)
      item.agregarLibroBasicoItem({ ...libro });
    return item;
  }

  public agregarItemsPedido(items?:ItemParaPedidoRetornoProp[]){
    if(!items || items.length === 0) return;
    for(const dto of items ){
      const item = this.agregarItemPedido({...dto});
      if (item) this.agregarItem(item);
    }
  }

  public agregarClienteRetorno({ id, nombre, email, telefono }: ClienteRetornoProp) {
    const cliente = new ClienteRetorno({
      id, nombre, email, telefono
    });
    this.cliente = cliente;
  }
}