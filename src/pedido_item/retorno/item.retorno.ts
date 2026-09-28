import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";
import { LibroMinimoRetornoProp, LibroRetorno, LibroRetornoProp } from "@src/libro/retorno/libro.retorno";
import { EstadoPedido } from "@src/pedido/interface/estadoPedido.enum";
import { ResumenRetornoProp } from "@src/retorno/resumen.retorno";
import { SedeRetorno, SedeRetornoProp } from "@src/sede/retorno/sede.retorno";
import { Especificaciones } from "../interface/especificaciones.interface";
import { PedidoParaClienteRetornoProp, PedidoRetorno, PedidoRetornoProp } from "@src/pedido/retorno/pedido.retorno";

export interface ItemRetornoProp extends Omit<BaseRetornoProp, 'id'> {
  estado?: EstadoPedido;
  idPedido: string;
  id: number;
  cantidad?: number;
  detalles?: string;
}

interface cambioSedeProp{
  id_libro: string;
  id_sede:string;
  id_cliente:string;
  sede:string;
}

export interface ItemCambioEstadoRetornoProp extends Omit<ResumenRetornoProp, 'id'> {
  id_libro: string
}

export interface ItemCompletoRetornoProp extends Omit<LibroMinimoRetornoProp, 'id'>, Pick<LibroRetornoProp, 'nombre' | 'editorial'> {
  id_sede: string;
  sede: string;
  id_libro: string;
}

interface EspecificacionesItemProp {
  especificaciones?: Especificaciones[],
}

interface AgregarPedidoItemProp extends PedidoParaClienteRetornoProp, PedidoRetornoProp{
  telefono?: string;
  email?:string;
  id_cliente:string;
}

interface LibroXitemRetornoProp {
  id_libro: string;
  cantidad_pg: number,
  cantidad_adhesivos?: number;
  nombre: string;
  descripcion?: string;
  edicion?: number;
  anio?: string;
  nivel?: string;
  componentes?: string;
  materia: string;
  id_materia: string;
  editorial?: string;

  pendiente: number;
  listo: number;
  retirado: number;
  cancelado: number;
}

export class ItemRetorno extends BaseRetorno {
  estado?: EstadoPedido;
  idPedido!: string;
  cantidad?: number;
  detalles?: string;
  especificaciones!: Especificaciones[];

  libro!: LibroRetorno;
  sede?: SedeRetorno;
  pedido?: PedidoRetorno;

  idCliente?:string;

  constructor({ id, fecha_actualizacion, fecha_creacion, deleted, estado, idPedido, cantidad, detalles }: ItemRetornoProp) {
    super({ id: id.toString(), fecha_actualizacion, fecha_creacion, deleted })
    this.estado = estado;
    this.idPedido = idPedido;
    this.cantidad = cantidad;
    this.detalles = detalles;
    this.especificaciones = [];
  }

  private agregarLibroResumenItem({ id, pendiente, listo, cancelado, retirado, stock }: ResumenRetornoProp) {
    const libro = new LibroRetorno({
      id
    })

    libro.agregarResumenLibroRetorno({ pendiente, listo, cancelado, retirado, stock });
    this.libro = libro;
  }

  public agregarEspecificacionesItem({ especificaciones }: EspecificacionesItemProp) {
    if (especificaciones && especificaciones.length > 0) {
      especificaciones.map(e => this.especificaciones.push(e))
    }
  }
  public cambioEstadoItemRetorno({ id_libro, pendiente, listo, cancelado, retirado, stock }: ItemCambioEstadoRetornoProp) {
    this.agregarLibroResumenItem({ id: id_libro, pendiente, listo, cancelado, retirado, stock })
  }

  public agregarLibroItem({
    id_libro, cantidad_pg, cantidad_adhesivos, nombre, descripcion, edicion, anio, nivel, componentes,
    materia, editorial, pendiente, listo, retirado, cancelado, id_materia
  }: LibroXitemRetornoProp) {
    const libro = new LibroRetorno({ id: id_libro, nombre, editorial });
    libro.armarLibroCompletoRetorno({
      cantidad_pg, cantidad_adhesivo: cantidad_adhesivos, edicion, anio, componentes_texto: componentes ?? '',
      nivel, pendiente, listo, retirado, cancelado, detalle_impresion: descripcion
    });
    libro.agregarMateriaLibroRetorno({ id: id_materia, nombre: materia });
    this.libro = libro;
  }

  public agregarIdLibroItem(id:string){
    const libro = new LibroRetorno({id});
    this.libro = libro;
  }

  public armarItemRetorno({
    edicion, anio, componentes, nivel, pendiente, listo, retirado, cancelado, stock,
    materia, id_materia, sede, id_sede, id_libro, nombre, editorial
  }: ItemCompletoRetornoProp) {
    const libro = new LibroRetorno({ id: id_libro, nombre, editorial });
    libro.armarLibroMinimo({
      edicion, anio, componentes, nivel, pendiente, listo, retirado, cancelado, stock,
      materia, id_materia
    });
    this.libro = libro;
    const newSede = new SedeRetorno({ id: id_sede, nombre: sede });
    this.sede = newSede;
  }

  public agregarSedeItemRetorno({ id, nombre }: SedeRetornoProp) {
    const sede = new SedeRetorno({ id, nombre });
    this.sede = sede;
  }

  public agregarPedidoAlItem({
    fechaEntrega, importeTotal, archivos, anillados, sena, estado, id, fecha_creacion, fecha_actualizacion, deleted,
    id_cliente, email, telefono
  }: AgregarPedidoItemProp) {
    const pedido = new PedidoRetorno({
      id, fecha_creacion, estado, fecha_actualizacion, deleted
    });
    pedido.agregarDatosPedido({
      fechaEntrega, importeTotal, archivos, anillados, sena
    });
    pedido.agregarClienteRetorno({id});
    pedido.agregarClienteRetorno({id:id_cliente, email, telefono});
    this.pedido = pedido;
  }

  public cambioSedeItem({id_cliente, id_libro, id_sede, sede}:cambioSedeProp) {
    this.idCliente = id_cliente;
    this.agregarIdLibroItem(id_libro);
    this.agregarSedeItemRetorno({id:id_sede, nombre:sede});
  }
}