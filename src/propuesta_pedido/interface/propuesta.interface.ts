import { NAMES_PROPUESTA } from "../default/propuesta.default";

export interface PropuestaDefaultProp {  
  nombre: typeof NAMES_PROPUESTA[keyof typeof NAMES_PROPUESTA];
  libros: string[]
}