import { Especificaciones } from "../../libro_pedido/interface/especificaciones.interface";

export interface EspecificacionDefaultProp {  
  nombre: typeof Especificaciones[keyof typeof Especificaciones];
}