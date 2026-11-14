import { Especificaciones } from '@src/pedido_item/interface/especificaciones.interface';

/**
 * Datos iniciales del sistema.
 *
 * Solo datos: sin SQL, sin TypeORM, sin logica. `seed.ts` los inserta de forma
 * idempotente, asi que este archivo se puede editar y volver a arrancar la API
 * sin duplicar filas.
 *
 * Los nombres respetan los largos de la base: nivel 30, componente 30,
 * materia 50, editorial 255, especificacion 10.
 */

/** `nivel.nombre` (varchar 30). */
export const NIVELES_DEFAULT: string[] = [
  'Inicial',
  'Primario',
  'Secundario',
  'Terciario',
  'Universitario',
];

/** `componente.nombre` (varchar 30). */
export const COMPONENTES_DEFAULT: string[] = [
  'Libro',
  'Cuadernillo',
  "Student's Book",
  'Workbook',
  'Activity Book',
  "Teacher's Book",
  'Practice Book',
];

/** `materia.nombre` (varchar 50). */
export const MATERIAS_DEFAULT: string[] = [
  'Lengua',
  'Prácticas del Lenguaje',
  'Matemática',
  'Ciencias Naturales',
  'Ciencias Sociales',
  'Historia',
  'Geografía',
  'Inglés',
  'Educación Física',
  'Educación Artística',
  'Música',
  'Informática',
  'Biología',
  'Física',
  'Química',
  'Formación Ética y Ciudadana',
];

/** `editorial.nombre` (varchar 255). */
export const EDITORIALES_DEFAULT: string[] = [
  'Santillana',
  'Puerto de Palos',
  'Estrada',
  'Kapelusz',
  'SM',
  'Oxford University Press',
  'Cambridge',
  'Longman',
  'Pearson',
  'Macmillan',
  'Aique',
  'Tinta Fresca',
  'Edelvives',
  'Norma',
  'Sigmar',
  'Loqueleo',
];

/**
 * `especificacion.nombre` (varchar 10).
 *
 * Sale del enum de la API para no tener dos listas que se desincronicen:
 * `fc_crear_libro` y `pedido_item_especificacion` comparan por este nombre.
 */
export const ESPECIFICACIONES_DEFAULT: string[] =
  Object.values(Especificaciones);
