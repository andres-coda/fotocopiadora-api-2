import { NAMES_COMPONENTE } from "../default/componente.default";

export interface ComponenteDefaultProp {  
  nombre: typeof NAMES_COMPONENTE[keyof typeof NAMES_COMPONENTE];
}