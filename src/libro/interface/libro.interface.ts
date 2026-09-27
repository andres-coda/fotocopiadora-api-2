import { EstadoPedido } from "@src/pedido/interface/estadoPedido.enum";
import { NAMES_COMPONENTE } from "../../componente/default/componente.default";
import { Especificaciones } from "../../pedido_item/interface/especificaciones.interface";
import { NAMES_MATERIAS } from "../../materia/default/materia.default";
import { NAMES_LIBRO } from "../default/libro_const_default";
import { GetMateriaAdapter } from "@src/materia/interface/materia.interface";

export interface LibroDefaultProp {
  nombre: typeof NAMES_LIBRO[keyof typeof NAMES_LIBRO];
  descripcion?: string;
  autor?: string;
  edicion?: number;
  nivel?: string;
  editorial?: string;
  anio?: string;
  img?: string;
  cantidadPg: number;
  adhesivos?: number;
  materia: typeof NAMES_MATERIAS[keyof typeof NAMES_MATERIAS];
  componentes?:  typeof NAMES_COMPONENTE[keyof typeof NAMES_COMPONENTE][];
  especificacionesDefecto?: Especificaciones[];
}

export interface GetLibroResumen {
  pendiente:number;
  listo: number;
  retirado:number;
  cancelado: number;
  stock:number;
}

export interface RetornoLibroNombreProp extends GetMateriaAdapter{
  id: string;
  nombre: string;
  editorial?: string;
}

export interface GetLibroMinimo extends RetornoLibroNombreProp, GetLibroResumen {
  descripcion?: string;
  edicion?: number;
  anio?: string;
  nivel?: string;
  componentes?: string;
}

export interface RetornoVistaLibroProp extends GetLibroMinimo{
  autor?:string;
  img?:string;
  cantidad_pg:number;
  cantidad_adhesivo?:number;
  especificaciones_defecto?:Especificaciones[];
  id_empresa:string;
  detalle_impresion?:string;
  id_libro?:string;
  id_emrpesa?:string;
}


