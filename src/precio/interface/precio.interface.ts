import { NAMES_PRECIO } from "../default/precio.default";

export interface PrecioDefaultProp {  
  nombre: typeof NAMES_PRECIO[keyof typeof NAMES_PRECIO];
  importe: number;
  abreviatura?: PrecioAbareviatura[];
}

export enum PrecioAbareviatura {
  BLANCO_Y_NEGRO = "byn",
  COLOR = "color",
  ADHESIVO = "adhes",
  TROKELADO = "trokelado",
  DOBLE_FAZ = "d_f",
  SIMPLE_FAZ = "s_f",
  ANILLADO_1 = 'Anillado_1',
  ANILLADO_2 = 'Anillado_2',
  ANILLADO_3 = 'Anillado_3',
  ANILLADO_4 = 'Anillado_4',
}