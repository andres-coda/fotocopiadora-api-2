import { QueryRunner } from 'typeorm';
import { Libro } from './default/libro_nombre';
import { LibroCompleto } from './default/libro_completo';
import { LibroLocal } from './default/libro_local';

/**
 * Carga de los catalogos de libros.
 *
 * No hay SQL a mano para `libro_completo`: `fc_obtener_or_crear_libro_completo`
 * ya resuelve el maestro, el nivel, los componentes y el propio libro completo,
 * y deduplica por libro + nivel + anio + edicion + set de componentes. Llamarla
 * en cada arranque es idempotente y evita que dos listas se desincronicen.
 *
 * Todo esto corre dentro de la transaccion de `ensureDatabaseSeed`, o sea como
 * `app_role` y con `app.user_id` seteado: los triggers de auditoria de `libro`,
 * `libro_completo` y `libro_empresa` necesitan ese contexto.
 *
 * POR QUE CADA FILA VA EN SU PROPIO try
 *   En Postgres un error aborta la transaccion entera: al reventar la fila 200
 *   de 396, todo lo anterior se pierde y el mensaje del driver no dice cual fue.
 *   Reenviar el error con el nombre de la entrada deja el log apuntando al dato
 *   que hay que corregir.
 */

/**
 * Vista de lectura de las entradas de `libro_nombre` y `libro_completo`.
 *
 * Los modulos de datos son `as const`, asi que su tipo es la union literal de
 * las 133 y 396 entradas: ahi una propiedad opcional no se puede leer sin
 * angostar cada miembro, porque el compilador solo conoce las que estan en
 * TODOS. Estas interfaces son la forma declarada de esos mismos datos, con las
 * opcionales marcadas como tales. Son solo de lectura: nadie muta el catalogo.
 */
interface LibroEntrada {
  readonly nombre: string;
  readonly materia?: string;
  readonly editorial?: string;
}

interface LibroCompletoEntrada {
  readonly libro: LibroEntrada;
  readonly nivel?: string;
  readonly componentes?: readonly string[];
  readonly descripcion?: string;
  readonly edicion?: string;
  readonly anio?: string;
  readonly img?: string;
  readonly autor?: string;
}

interface LibroLocalEntrada {
  readonly libro: LibroCompletoEntrada;
  readonly cantidadPg: number;
  readonly adhesivos?: number;
  readonly especificacion_defecto?: readonly string[];
}

const LIBROS: readonly LibroEntrada[] = Object.values(Libro);
const LIBROS_COMPLETOS: readonly LibroCompletoEntrada[] =
  Object.values(LibroCompleto);
const LIBROS_LOCALES: readonly LibroLocalEntrada[] = Object.values(LibroLocal);

/**
 * Resuelve el id de un libro completo llamando a la funcion que deduplica.
 *
 * Devuelve el id existente o el del registro recien creado, sin distinguir el
 * caso: a los llamadores solo les importa el id.
 */
async function resolverIdLibroCompleto(
  runner: QueryRunner,
  entrada: LibroCompletoEntrada,
): Promise<string> {
  const filas = (await runner.query(
    `select public.fc_obtener_or_crear_libro_completo(
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb
     ) as id`,
    [
      entrada.libro.nombre,
      entrada.libro.editorial ?? null,
      entrada.libro.materia ?? null,
      entrada.nivel ?? null,
      entrada.anio ?? null,
      entrada.autor ?? null,
      entrada.img ?? null,
      entrada.edicion ?? null,
      entrada.descripcion ?? null,
      JSON.stringify(entrada.componentes ?? []),
    ],
  )) as { id: string }[];

  return filas[0].id;
}

/**
 * Carga `libro` y `libro_completo` desde los modulos de datos.
 *
 * REGLA DE BASE VACIA: solo siembra cuando las dos tablas estan vacias. En una
 * base con catalogo propio (o con el catalogo ya cargado por un arranque
 * anterior) no se toca nada: agregar 133 libros a una base en produccion no es
 * un seed, es un cambio de datos.
 */
export async function insertarLibrosDefault(
  runner: QueryRunner,
): Promise<{ libros: number; completos: number }> {
  const [{ vacia }] = (await runner.query(
    `select (not exists (select 1 from libro)
             and not exists (select 1 from libro_completo)) as vacia`,
  )) as { vacia: boolean }[];

  if (!vacia) {
    return { libros: 0, completos: 0 };
  }

  let libros = 0;
  for (const entrada of LIBROS) {
    try {
      await runner.query(
        `select public.fc_obtener_o_crear_libro($1, $2, $3) as id`,
        [entrada.nombre, entrada.editorial ?? null, entrada.materia ?? null],
      );
      libros += 1;
    } catch (error) {
      throw new Error(
        `Fallo el libro "${entrada.nombre}": ${(error as Error).message}`,
      );
    }
  }

  let completos = 0;
  for (const entrada of LIBROS_COMPLETOS) {
    try {
      await resolverIdLibroCompleto(runner, entrada);
      completos += 1;
    } catch (error) {
      throw new Error(
        `Fallo el libro completo "${entrada.libro.nombre}": ` +
          `${(error as Error).message}`,
      );
    }
  }

  return { libros, completos };
}

/**
 * Carga el catalogo local de una empresa: cantidad de paginas, adhesivos y
 * especificaciones por defecto de los libros que ya usa.
 *
 * `cantidad_adhesivo` es NOT NULL en la tabla, asi que el default de los datos
 * (que casi nunca trae adhesivos) cae en 0 y no en null.
 *
 * `on conflict (id_empresa, id_libro) do nothing` deja la funcion idempotente:
 * si la empresa ya tenia ese libro con otros valores, los del cliente mandan.
 */
export async function insertarLibroLocalDefault(
  runner: QueryRunner,
  idEmpresa: string,
): Promise<number> {
  let insertados = 0;

  for (const entrada of LIBROS_LOCALES) {
    const nombre = entrada.libro.libro.nombre;

    try {
      const idLibro = await resolverIdLibroCompleto(runner, entrada.libro);

      const filas = (await runner.query(
        `insert into libro_empresa (
           id_empresa,
           id_libro,
           cantidad_pg,
           cantidad_adhesivo,
           especificaciones_defecto
         )
         values ($1, $2, $3, $4, $5::jsonb)
         on conflict (id_empresa, id_libro) do nothing
         returning 1`,
        [
          idEmpresa,
          idLibro,
          entrada.cantidadPg,
          entrada.adhesivos ?? 0,
          JSON.stringify(entrada.especificacion_defecto ?? []),
        ],
      )) as unknown[];

      insertados += filas.length;
    } catch (error) {
      throw new Error(
        `Fallo el libro local "${nombre}" de la empresa ${idEmpresa}: ` +
          `${(error as Error).message}`,
      );
    }
  }

  return insertados;
}
