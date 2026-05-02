import { SedeDefaultProp } from "../interface/sede.interface";

export const NAMES_SEDE= {
  LOCAL: 'Local',
} as const;

export const SEDE_DEFAULT: SedeDefaultProp[] = [
  {
    nombre:NAMES_SEDE.LOCAL,
  }
]