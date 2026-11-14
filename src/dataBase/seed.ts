import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, QueryRunner } from 'typeorm';
import {
  CATEGORIAS_PRECIO_DEFAULT_LISTA,
  PRECIO_DEFAULT,
} from '@src/precio/default/precio.default';
import { buildDataSource, readDatabase } from './schema.bootstrap';
import {
  COMPONENTES_DEFAULT,
  EDITORIALES_DEFAULT,
  EMPRESA_DEFAULT,
  ESPECIFICACIONES_DEFAULT,
  MATERIAS_DEFAULT,
  NIVELES_DEFAULT,
} from './seed.data';

/**
 * Datos iniciales de la base.
 *
 * Corre despues de `ensureDatabaseSchema` y en CADA arranque, porque es
 * idempotente: solo inserta lo que falta. No comparte transaccion con el dump
 * por dos motivos:
 *
 *   1. Un error de datos no puede costar las 31 tablas del esquema.
 *   2. Si el dump commitea y esto fallara en la misma transaccion, el bootstrap
 *      cortaria en `public.usuario` y los datos no llegarian nunca mas.
 *
 * ORDEN OBLIGATORIO: primero el super_admin, despues el catalogo.
 * Los triggers de auditoria (`tr_nivel_auditoria`, `tr_empresa_auditoria`,
 * `tr_auditoria_lprecio`, ...) escriben `auditoria.id_usuario` con
 * `fc_usuario_actual()`, y `fc_auditoria` ademas llama `fc_empresa_actual()`,
 * que hace `PERFORM fc_cargar_contexto_usuario()` y lanza
 * `Usuario % no encontrado` cuando `app.user_id` esta vacio. O sea: sin un
 * usuario en el contexto, el primer `insert into nivel` ya falla. Por eso el
 * super_admin se crea antes (la tabla `usuario` no tiene trigger de auditoria
 * en INSERT) y su id se publica con `set_config('app.user_id', ..., true)`.
 *
 * Las policies de INSERT de los catalogos piden `fc_usuario_actual() IS NOT
 * NULL`: con el GUC puesto se cumplen. Lo que NO se puede saltear es el rol:
 * `auditoria` tiene FORCE ROW LEVEL SECURITY y su unica policy es de SELECT
 * (`pc_auditoria_select`), asi que el INSERT de `fc_auditoria` solo pasa con un
 * rol superusuario o con BYPASSRLS. `DB_BOOTSTRAP_USERNAME` tiene que ser uno
 * de los dos; `app_role` no sirve para el seed.
 */

const LOGGER_CONTEXT = 'DatabaseSeed';

/** `usuario.nombre` y `usuario.email` son varchar(50). */
const MAX_LARGO_USUARIO = 50;

/**
 * `auditoria` es FORCE RLS con una sola policy de SELECT: sin BYPASSRLS, el
 * trigger de auditoria rechaza el insert y el seed no puede escribir nada.
 */
async function rolPuedeEscribirAuditoria(source: DataSource): Promise<boolean> {
  // `DataSource.query` si acepta el generico (a diferencia de `QueryRunner.query`).
  const filas = await source.query<{ ok: boolean }[]>(
    `select coalesce(
       (select rolsuper or rolbypassrls from pg_roles where rolname = current_user),
       false
     ) as ok`,
  );

  return filas[0]?.ok === true;
}

/** Catalogos con UNIQUE(nombre): el conflicto alcanza para ser idempotente. */
type TablaConNombreUnico =
  | 'nivel'
  | 'componente'
  | 'materia'
  | 'editorial'
  | 'especificacion';

/** Inserta solo los nombres que faltan y devuelve cuantos entraron. */
async function insertarCatalogo(
  runner: QueryRunner,
  tabla: TablaConNombreUnico,
  nombres: string[],
): Promise<number> {
  let nuevos = 0;

  for (const nombre of nombres) {
    // `tabla` viene de una union cerrada, no de datos externos.
    const insertadas = (await runner.query(
      `insert into ${tabla} (nombre) values ($1)
       on conflict (nombre) do nothing
       returning id`,
      [nombre],
    )) as { id: string }[];

    nuevos += insertadas.length;
  }

  return nuevos;
}

/**
 * Garantiza las tres categorias bloqueadas y devuelve cuantas se crearon.
 *
 * Si una categoria con ese nombre ya existia pero quedo desbloqueada, la vuelve
 * a marcar: el lateral de precios y la carga inicial dependen de que esas tres
 * esten bloqueadas.
 */
async function asegurarCategoriasBloqueadas(
  runner: QueryRunner,
  logger: Logger,
): Promise<number> {
  let nuevas = 0;

  for (const nombre of CATEGORIAS_PRECIO_DEFAULT_LISTA) {
    const creadas = (await runner.query(
      `insert into precio_categoria (nombre, bloqueado) values ($1, true)
       on conflict (nombre) do nothing
       returning id`,
      [nombre],
    )) as { id: string }[];

    if (creadas.length > 0) {
      nuevas += 1;
      continue;
    }

    const corregidas = (await runner.query(
      `update precio_categoria set bloqueado = true
       where nombre = $1 and bloqueado is distinct from true
       returning id`,
      [nombre],
    )) as { id: string }[];

    if (corregidas.length > 0) {
      logger.warn(
        `La categoria "${nombre}" existia desbloqueada: quedo bloqueada.`,
      );
    }
  }

  return nuevas;
}

/**
 * Crea la empresa inicial solo si no hay ninguna, con los precios por defecto.
 *
 * Una empresa sin precios no puede presupuestar nada, y su alta normal
 * (`EmpresaService.createDatoCx`) siempre crea empresa + precios en la misma
 * transaccion: aca se hace lo mismo, sin el usuario admin porque no hay
 * credenciales para el en el entorno.
 */
async function sembrarEmpresa(
  runner: QueryRunner,
  logger: Logger,
): Promise<void> {
  const [{ total }] = (await runner.query(
    'select count(*)::int as total from empresa',
  )) as { total: number }[];

  if (total > 0) {
    return;
  }

  const [empresa] = (await runner.query(
    `insert into empresa (nombre, email, telefono) values ($1, $2, $3)
     on conflict do nothing
     returning id`,
    [EMPRESA_DEFAULT.nombre, EMPRESA_DEFAULT.email, EMPRESA_DEFAULT.telefono],
  )) as { id: string }[];

  if (!empresa) {
    // Otra instancia gano la carrera por el nombre/email/telefono unico.
    logger.warn(
      'La empresa inicial ya fue creada por otra instancia: no se cargan sus precios.',
    );
    return;
  }

  for (const precio of PRECIO_DEFAULT) {
    // `precio` es global y tiene DOS unicos: nombre y abreviatura. `on conflict
    // (nombre)` no cubriria el caso de una fila que quedo con la misma
    // abreviatura y otro nombre, asi que se pregunta por los dos.
    await runner.query(
      `insert into precio (nombre, abreviatura)
       select $1, $2
       where not exists (
         select 1 from precio where nombre = $1 or abreviatura = $2
       )
       on conflict do nothing`,
      [precio.nombre, precio.abreviatura ?? null],
    );

    const [fila] = (await runner.query(
      `select id from precio where nombre = $1 or abreviatura = $2 limit 1`,
      [precio.nombre, precio.abreviatura ?? null],
    )) as { id: string }[];

    const [categoria] = (await runner.query(
      'select id from precio_categoria where nombre = $1',
      [precio.categoria],
    )) as { id: string }[];

    await runner.query(
      `insert into precio_empresa (id_empresa, id_precio, importe, id_categoria)
       values ($1, $2, $3, $4)
       on conflict do nothing`,
      [empresa.id, fila.id, precio.importe, categoria?.id ?? null],
    );
  }

  logger.log(
    `Empresa inicial "${EMPRESA_DEFAULT.nombre}" creada con ${PRECIO_DEFAULT.length} precios.`,
  );
}

/**
 * Deja un super_admin disponible y devuelve su id, que es el contexto de
 * auditoria de todo lo que se inserta despues.
 *
 * Nunca tumba el arranque: si no puede crearlo avisa y devuelve null, y el
 * caller no carga el catalogo. La base admite un solo super_admin
 * (`uq_super_admin` es un indice unico parcial sobre `rol`, y cuenta tambien
 * las filas borradas), asi que se pregunta antes de insertar.
 */
async function asegurarSuperAdmin(
  runner: QueryRunner,
  config: ConfigService,
  logger: Logger,
): Promise<{ id: string; creado: boolean } | null> {
  const [{ total }] = (await runner.query(
    `select count(*)::int as total from usuario where rol = 'super_admin'`,
  )) as { total: number }[];

  if (total > 0) {
    const [existente] = (await runner.query(
      `select id from usuario where rol = 'super_admin'
       order by fecha_creacion limit 1`,
    )) as { id: string }[];

    logger.log('Ya existe un super_admin: se usa como contexto de auditoria.');
    return { id: existente.id, creado: false };
  }

  const nombre = config.get<string>('SUPER_USER')?.trim() ?? '';
  const email = config.get<string>('SUPER_MAIL')?.trim() ?? '';
  const password = config.get<string>('SUPER_PASS') ?? '';

  const faltantes = [
    ['SUPER_USER', nombre],
    ['SUPER_MAIL', email],
    ['SUPER_PASS', password],
  ]
    .filter(([, valor]) => !valor)
    .map(([clave]) => clave);

  if (faltantes.length > 0) {
    logger.warn(
      `No se pudo crear el super: variables inexistentes (${faltantes.join(', ')}).`,
    );
    return null;
  }

  if (nombre.length > MAX_LARGO_USUARIO || email.length > MAX_LARGO_USUARIO) {
    logger.warn(
      `No se pudo crear el super: SUPER_USER y SUPER_MAIL no pueden pasar de ` +
        `${MAX_LARGO_USUARIO} caracteres (largo de la tabla usuario).`,
    );
    return null;
  }

  const [mismoEmail] = (await runner.query(
    'select 1 as ok from usuario where email = $1',
    [email],
  )) as { ok: number }[];

  if (mismoEmail) {
    logger.warn(
      `No se pudo crear el super: el email "${email}" ya pertenece a otro usuario.`,
    );
    return null;
  }

  const [{ ok: hayCrypt }] = (await runner.query(
    `select to_regprocedure('public.crypt(text,text)') is not null as ok`,
  )) as { ok: boolean }[];

  if (!hayCrypt) {
    logger.warn(
      'No se pudo crear el super: public.crypt no existe. pgcrypto tiene que ' +
        'estar instalada en el schema public (fc_login la usa para validar).',
    );
    return null;
  }

  const [creado] = (await runner.query(
    `insert into usuario (nombre, email, password_hash, rol, id_empresa)
     values ($1, $2, public.crypt($3, public.gen_salt('bf', 10)), 'super_admin', null)
     on conflict do nothing
     returning id`,
    [nombre, email, password],
  )) as { id: string }[];

  if (!creado) {
    // Otra instancia lo creo entre el count y este insert.
    logger.warn(
      'No se pudo crear el super: otra instancia lo creo en paralelo. ' +
        'Se reintenta en el proximo arranque.',
    );
    return null;
  }

  logger.log(`super_admin "${nombre}" creado.`);

  return { id: creado.id, creado: true };
}

/**
 * Garantiza los datos iniciales. Idempotente: se puede correr en cada arranque.
 */
export async function ensureDatabaseSeed(config: ConfigService): Promise<void> {
  const logger = new Logger(LOGGER_CONTEXT);
  const database = readDatabase(config);
  const source = buildDataSource(config, database);

  await source.initialize();

  try {
    // `auditoria` es FORCE RLS con una unica policy de SELECT, y cada insert de
    // catalogo escribe ahi via `fc_auditoria`. Sin BYPASSRLS el seed no puede
    // hacer nada, y el error de Postgres no lo explica: se avisa y se sale.
    if (!(await rolPuedeEscribirAuditoria(source))) {
      logger.warn(
        'No se cargan los datos iniciales: el rol de bootstrap no puede ' +
          'escribir en public.auditoria (FORCE RLS, sin policy de INSERT). ' +
          'Necesita ser superusuario o tener BYPASSRLS (DB_BOOTSTRAP_USERNAME).',
      );
      return;
    }

    const runner = source.createQueryRunner();
    await runner.connect();

    try {
      await runner.query('BEGIN');

      try {
        // `fc_login` y el hash de contrasenas usan public.crypt /
        // public.gen_salt. El dump no crea la extension, asi que en una base
        // nueva no existe y nadie podria iniciar sesion. Se instala en `public`
        // porque las funciones del esquema la llaman calificada.
        await runner.query(
          'CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public',
        );

        const superAdmin = await asegurarSuperAdmin(runner, config, logger);

        if (!superAdmin) {
          // Sin usuario no hay contexto de auditoria y los triggers de INSERT
          // de los catalogos tiran excepcion. Se corta sin romper el arranque.
          logger.warn(
            'No se cargan los datos iniciales: hace falta un usuario para el ' +
              'contexto de auditoria (app.user_id).',
          );
          await runner.query('COMMIT');
          return;
        }

        // `true` = local a la transaccion: el GUC muere en el COMMIT y no
        // contamina las conexiones del pool de la aplicacion.
        await runner.query(`select set_config('app.user_id', $1, true)`, [
          superAdmin.id,
        ]);

        const niveles = await insertarCatalogo(
          runner,
          'nivel',
          NIVELES_DEFAULT,
        );
        const componentes = await insertarCatalogo(
          runner,
          'componente',
          COMPONENTES_DEFAULT,
        );
        const materias = await insertarCatalogo(
          runner,
          'materia',
          MATERIAS_DEFAULT,
        );
        const editoriales = await insertarCatalogo(
          runner,
          'editorial',
          EDITORIALES_DEFAULT,
        );
        const especificaciones = await insertarCatalogo(
          runner,
          'especificacion',
          ESPECIFICACIONES_DEFAULT,
        );
        const categorias = await asegurarCategoriasBloqueadas(runner, logger);

        await sembrarEmpresa(runner, logger);

        await runner.query('COMMIT');

        const insertados =
          niveles +
          componentes +
          materias +
          editoriales +
          especificaciones +
          categorias;

        if (insertados > 0) {
          logger.log(
            `Datos iniciales en "${database}": ${niveles} niveles, ` +
              `${componentes} componentes, ${materias} materias, ` +
              `${editoriales} editoriales, ${especificaciones} especificaciones, ` +
              `${categorias} categorias bloqueadas.`,
          );
        } else {
          logger.log('Datos iniciales ya presentes: no se inserta nada.');
        }
      } catch (error) {
        await runner.query('ROLLBACK').catch(() => undefined);
        throw new Error(
          `Fallo la carga de datos iniciales en "${database}": ` +
            `${(error as Error).message}`,
        );
      }
    } finally {
      await runner.release();
    }
  } finally {
    await source.destroy();
  }
}
