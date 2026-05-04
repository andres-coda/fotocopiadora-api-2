import { LibroDefaultProp } from "../interface/libro.interface";
import { LIBRO_BRIGHT, LIBRO_BRIGHTER, LIBRO_LEARN, LIBRO_LEARN_NOW } from "./libro_biblioteca-default";

export const LIBRO_DEFAULT: LibroDefaultProp[] = [
  ...LIBRO_LEARN,
  ...LIBRO_LEARN_NOW,
  ...LIBRO_BRIGHT,
  ...LIBRO_BRIGHTER
]