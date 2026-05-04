import { NAMES_PRECIO } from "../default/precio.default";

export interface PrecioDefaultProp {  
  nombre: typeof NAMES_PRECIO[keyof typeof NAMES_PRECIO];
  importe: number;
}