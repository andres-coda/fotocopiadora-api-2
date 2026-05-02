import { NAMES_SEDE } from "../default/sede.default";

export interface SedeDefaultProp {  
  nombre: typeof NAMES_SEDE[keyof typeof NAMES_SEDE];
}