import { Especificaciones } from "../../pedido_item/interface/especificaciones.interface";

export interface EspecificacionDefaultProp {  
  nombre: typeof Especificaciones[keyof typeof Especificaciones];
}