import { EstadoPedido } from "@src/pedido/interface/estadoPedido.enum";
import { NAMES_COMPONENTE } from "../../componente/default/componente.default";
import { Especificaciones } from "../../pedido_item/interface/especificaciones.interface";
import { NAMES_MATERIAS } from "../../materia/default/materia.default";
import { NAMES_LIBRO } from "../default/libro_const_default";

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

export interface RetornoVistaLibroProp{
  id: string;
  nombre: string;
  descripcion?:string;
  edicion: number;
  autor?:string;
  anio?: string;
  img?:string;
  nivel:string;
  componentes?: string;
  cantidad_pg:number;
  cantidad_adhesivo?:number;
  especificaciones_defecto?:Especificaciones[];
  materia:string;
  editorial?:string;
  pendiente:number;
  listo:number;
  retirado:number;
  cancelado:number;
  id_empresa:string;
  id_materia:string;
}


