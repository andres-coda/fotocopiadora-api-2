import { Especificaciones } from '@src/pedido_item/interface/especificaciones.interface';
import { Componente } from './default/componente';
import { Editorial } from './default/editorial';
import { Materia } from './default/materia';
import { Nivel } from './default/nivel';

/**
 * Datos iniciales del sistema.
 *
 * Solo datos: sin SQL, sin TypeORM, sin logica. `seed.ts` los inserta de forma
 * idempotente, asi que este archivo se puede editar y volver a arrancar la API
 * sin duplicar filas.
 *
 * Las cuatro listas salen de los modulos de `./default`, que son los mismos que
 * consumen los libros (`libro_nombre`, `libro_completo`): una sola definicion de
 * cada nombre. Si un libro referencia una editorial o una materia, esa fila
 * existe sin depender de que este archivo la haya listado antes.
 *
 * Los nombres respetan los largos de la base: nivel 30, componente 30,
 * materia 50, editorial 255, especificacion 10.
 */

/** `nivel.nombre` (varchar 30). */
export const NIVELES_DEFAULT: string[] = Object.values(Nivel);

/** `componente.nombre` (varchar 30). */
export const COMPONENTES_DEFAULT: string[] = Object.values(Componente);

/** `materia.nombre` (varchar 50). */
export const MATERIAS_DEFAULT: string[] = Object.values(Materia);

/** `editorial.nombre` (varchar 255). */
export const EDITORIALES_DEFAULT: string[] = Object.values(Editorial);

/**
 * `especificacion.nombre` (varchar 10).
 *
 * Sale del enum de la API para no tener dos listas que se desincronicen:
 * `fc_crear_libro` y `pedido_item_especificacion` comparan por este nombre.
 */
export const ESPECIFICACIONES_DEFAULT: string[] =
  Object.values(Especificaciones);
