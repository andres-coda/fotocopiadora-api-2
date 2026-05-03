import { ComponenteDefaultProp } from "../interface/componente.interface";

export const NAMES_COMPONENTE = {
  STUDENT: 'Student Book',
  ACTIVITY: 'Activity Book',
  CLASS: 'Classbook',
  PUPILS: 'Pupils Book',
  TEACHER: 'Teach Book',
  WORKBOOK: 'Workbook',
} as const;

export const COMPONENTE_DEFAULT: ComponenteDefaultProp[] = [
  {
    nombre:NAMES_COMPONENTE.STUDENT,
  },
  {
    nombre:NAMES_COMPONENTE.ACTIVITY,
  },
  {
    nombre:NAMES_COMPONENTE.CLASS,
  },
  {
    nombre:NAMES_COMPONENTE.PUPILS,
  },
  {
    nombre:NAMES_COMPONENTE.TEACHER,
  },
  {
    nombre:NAMES_COMPONENTE.WORKBOOK,
  },
]