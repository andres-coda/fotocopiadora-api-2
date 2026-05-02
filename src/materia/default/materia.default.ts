import { MateriaDefaultProp } from "../interface/materia.interface";

export const NAMES_MATERIAS = {
  INGLES: 'Ingles',
  MATEMATICA: 'Matemática',
  BICIEINCIAS: 'Biciencias',
  LENGUA: 'Lengua',
  HISTORIA: 'Hístoria',
  GEOGRAFIA: 'Geografía',
  CS_SOCIALES: 'Cs Sociales',
  CS_NATURALES: 'Cs Naturales',
  FISICA: 'Física',
  QUIMICA: 'Quimica',
} as const;

export const MATERIAS_DEFAULT: MateriaDefaultProp[] = [
  {
    nombre: NAMES_MATERIAS.INGLES,
  }, 
  {
    nombre: NAMES_MATERIAS.MATEMATICA,
  },
  {
    nombre: NAMES_MATERIAS.BICIEINCIAS,
  },
  {
    nombre: NAMES_MATERIAS.LENGUA,
  },
  {
    nombre: NAMES_MATERIAS.HISTORIA,
  },
  {
    nombre: NAMES_MATERIAS.GEOGRAFIA,
  },
  {
    nombre: NAMES_MATERIAS.CS_NATURALES,
  },
  {
    nombre: NAMES_MATERIAS.CS_SOCIALES,
  },
  {
    nombre: NAMES_MATERIAS.FISICA,
  },
  {
    nombre: NAMES_MATERIAS.QUIMICA,
  },
]