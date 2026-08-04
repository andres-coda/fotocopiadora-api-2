import { NAMES_PRECIO } from "../default/precio.default";

export interface PrecioDefaultProp {  
  nombre: typeof NAMES_PRECIO[keyof typeof NAMES_PRECIO];
  importe: number;
  abreviatura?: PrecioAbareviatura;
}

export enum PrecioAbareviatura {
  BLANCO_Y_NEGRO_S_F = "byn",
  COLOR_S_F = "color",
  ADHESIVO = "adhes",
  TROKELADO = "trokelado",
  BLANCO_Y_NEGRO_D_F = "byn_d_f",
  COLOR_D_F = "color_d_f",
  ANILLADO_1 = 'anillado_1',
  ANILLADO_2 = 'anillado_2',
  ANILLADO_3 = 'anillado_3',
  ANILLADO_4 = 'anillado_4',
}