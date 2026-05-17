import { PrecioAbareviatura, PrecioDefaultProp } from "../interface/precio.interface";

export const NAMES_PRECIO = {
  COLOR_DOBLEFAZ: 'Color, doble faz',
  COLOR_SIMPLEFAZ: 'Color, simple faz',
  BLANCOYNEGRO_DOBLEFAZ: 'Blanco y negro, doble faz',
  BLANCOYNEGRO_SIMPLEFAZ: 'Blanco y negro, simple faz',
  ANILLADO1: 'Anillado 1 - 100 hojas',
  ANILLADO2: 'Anillado 101 - 250 hojas',
  ANILLADO3: 'Anillado 251 - 350 hojas',
  ANILLADO4: 'Anillado 351 - 500 hojas',
  ADHESIVO: 'Adhesivo blanco brilloso',
  TROKELADO: 'Adhesivo blanco brilloso trokelado',
} as const;

export const PRECIO_DEFAULT: PrecioDefaultProp[] = [
  {
    nombre:NAMES_PRECIO.COLOR_DOBLEFAZ,
    importe: 200,
    abreviatura: [PrecioAbareviatura.COLOR, PrecioAbareviatura.DOBLE_FAZ]
  }, 
  {
    nombre:NAMES_PRECIO.COLOR_SIMPLEFAZ,
    importe: 180,
    abreviatura: [PrecioAbareviatura.COLOR, PrecioAbareviatura.SIMPLE_FAZ]
  },
  {
    nombre:NAMES_PRECIO.BLANCOYNEGRO_DOBLEFAZ,
    importe: 140,
    abreviatura: [PrecioAbareviatura.BLANCO_Y_NEGRO, PrecioAbareviatura.DOBLE_FAZ]
  },
  {
    nombre:NAMES_PRECIO.BLANCOYNEGRO_SIMPLEFAZ,
    importe: 120,
    abreviatura: [PrecioAbareviatura.BLANCO_Y_NEGRO, PrecioAbareviatura.SIMPLE_FAZ]
  },
  {
    nombre:NAMES_PRECIO.ANILLADO1,
    importe: 2400,
    abreviatura: [PrecioAbareviatura.ANILLADO_1]
  },
  {
    nombre:NAMES_PRECIO.ANILLADO2,
    importe: 2500,
    abreviatura: [PrecioAbareviatura.ANILLADO_2]
  },
  {
    nombre:NAMES_PRECIO.ANILLADO3,
    importe:2600,
    abreviatura: [PrecioAbareviatura.ANILLADO_3]
  },
  {
    nombre:NAMES_PRECIO.ANILLADO4,
    importe: 2700,
    abreviatura: [PrecioAbareviatura.ANILLADO_4]
  },
  {
    nombre:NAMES_PRECIO.ADHESIVO,
    importe: 850,
    abreviatura: [PrecioAbareviatura.ADHESIVO]
  },
  {
    nombre:NAMES_PRECIO.ADHESIVO,
    importe: 850,
    abreviatura: [PrecioAbareviatura.ADHESIVO]
  },
  {
    nombre:NAMES_PRECIO.TROKELADO,
    importe: 1700,
    abreviatura: [PrecioAbareviatura.TROKELADO]
  },
]