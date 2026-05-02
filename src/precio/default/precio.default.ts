import { PrecioDefaultProp } from "../interface/precio.interface";

export const NAMES_PRECIO = {
  COLOR_DOBLEFAZ: 'Color, doble faz',
  COLOR_SIMPLEFAZ: 'Color, simple faz',
  BLANCOYNEGRO_DOBLEFAZ: 'Blanco y negro, doble faz',
  BLANCOYNEGRO_SIMPLEFAZ: 'Blanco y negro, simple faz',
  ANILLADO1: 'Anillado 1 - 100 hojas',
  ANILLADO2: 'Anillado 101 - 250 hojas',
  ANILLADO3: 'Anillado 251 - 350 hojas',
  ANILLADO4: 'Anillado 351 - 500 hojas',
} as const;

export const PRECIO_DEFAULT: PrecioDefaultProp[] = [
  {
    nombre:NAMES_PRECIO.COLOR_DOBLEFAZ,
    importe: 180
  }, 
  {
    nombre:NAMES_PRECIO.COLOR_SIMPLEFAZ,
    importe: 160
  },
  {
    nombre:NAMES_PRECIO.BLANCOYNEGRO_DOBLEFAZ,
    importe: 120
  },
  {
    nombre:NAMES_PRECIO.BLANCOYNEGRO_SIMPLEFAZ,
    importe: 110
  },
  {
    nombre:NAMES_PRECIO.ANILLADO1,
    importe: 2100
  },
  {
    nombre:NAMES_PRECIO.ANILLADO2,
    importe: 2300
  },
  {
    nombre:NAMES_PRECIO.ANILLADO3,
    importe:2500
  },
  {
    nombre:NAMES_PRECIO.ANILLADO4,
    importe: 2700
  },
]