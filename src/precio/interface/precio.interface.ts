import { NAMES_PRECIO } from "../default/precio.default";

export interface PrecioDefaultProp {  
  tipo: typeof NAMES_PRECIO[keyof typeof NAMES_PRECIO];
  importe: number;
}