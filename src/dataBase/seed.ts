import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryRunner } from 'typeorm';
import { CATEGORIAS_PRECIO_DEFAULT_LISTA } from '@src/precio/default/precio.default';
import { buildDataSource, readDatabase } from './schema.bootstrap';
import { insertarLibrosDefault } from './seed.libros';
import {
  COMPONENTES_DEFAULT,
  EDITORIALES_DEFAULT,
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
 * REPARTO DE ROLES: lo unico que corre fuera de `app_role` es la creacion del
 * `super_admin`. Todo el catalogo se carga DESPUES de `SET LOCAL ROLE app_role`
 * y con ese usuario en el contexto de auditoria, igual que un request real.
 *
 * POR QUE ESE ORDEN
 *   - `nivel`, `componente` y `materia` tienen trigger de auditoria: su `insert`
 *     dispara `fc_auditoria`, que escribe `auditoria.id_usuario` NOT NULL con
 *     `fc_usuario_actual()` y ademas llama `fc_empresa_actual()` ->
 *     `fc_cargar_contexto_usuario()`, que lanza `Usuario % no encontrado` cuando
 *     `app.user_id` esta vacio. `editorial`, `especificacion` y `precio_categoria`
 *     no tienen trigger, pero sus policies llaman a las mismas funciones. Sin
 *     usuario en el contexto, el primer `insert` ya falla.
 *   - `pc_especificacion_insert` es la unica de las seis que no se conforma con
 *     `fc_usuario_actual() IS NOT NULL`: exige `fc_es_super_admin()`. Con el
 *     super_admin logueado pasa; con cualquier otro contexto, no.
 *   - `usuario` no tiene trigger de auditoria en INSERT, por eso el super se
 *     puede crear antes de que exista el GUC.
 *
 * SOBRE `auditoria`
 *   Tiene FORCE ROW LEVEL SECURITY y su unica policy es de SELECT. `app_role`
 *   solo tiene GRANT SELECT sobre ella: el INSERT lo hace `fc_auditoria`, que es
 *   SECURITY DEFINER y corre como su dueno (el rol de bootstrap, superusuario).
 *   Por eso el catalogo puede auditarse como `app_role` sin BYPASSRLS.
 *
 * REQUISITO DEL ROL DE BOOTSTRAP
 *   `DB_BOOTSTRAP_USERNAME` tiene que cumplir dos cosas:
 *     1. Ser superusuario o tener BYPASSRLS. No por `app_role`: el INSERT en
 *        `auditoria` lo hace `fc_auditoria`, que es SECURITY DEFINER y corre
 *        como su dueno, o sea el rol que aplico el dump. Si ese rol no saltea
 *        RLS, cada insert de catalogo falla con un error de policy.
 *     2. Poder asumir `app_role` (`set local role`), es decir ser superusuario o
 *        miembro de `app_role`. `postgres` siempre puede.
 *   Las dos condiciones se verifican antes de mutar nada; si fallan, se avisa y
 *   el arranque sigue sin datos.
 */

const LOGGER_CONTEXT = 'DatabaseSeed';
const APP_ROLE = 'app_role';

/** `usuario.nombre` y `usuario.email` son varchar(50). */
const MAX_LARGO_USUARIO = 50;

/**
 * Catalogos con UNIQUE(nombre): `on conflict (nombre) do nothing` hace de
 * verificacion previa en la misma instruccion, sin round-trip extra y sin
 * ventana de carrera.
 */
type TablaConNombreUnico =
  | 'nivel'
  | 'componente'
  | 'materia'
  | 'editorial'
  | 'especificacion';

/**
 * Inserta todos los nombres en UNA sola instruccion y devuelve cuantos entraron.
 *
 * `unnest($1::text[])` convierte el array en filas dentro del servidor: un solo
 * viaje por tabla en vez de uno por nombre.
 */
async function insertarCatalogo(
  runner: QueryRunner,
  tabla: TablaConNombreUnico,
  nombres: string[],
): Promise<number> {
  if (nombres.length === 0) {
    return 0;
  }

  // `tabla` viene de una union cerrada, no de datos externos.
  const insertadas = (await runner.query(
    `insert into ${tabla} (nombre)
     select t.nombre from unnest($1::text[]) as t(nombre)
     on conflict (nombre) do nothing
     returning 1`,
    [nombres],
  )) as unknown[];

  return insertadas.length;
}

/**
 * Garantiza las tres categorias bloqueadas en una sola instruccion.
 *
 * Devuelve cuantas filas quedaron tocadas: las nuevas y las que existian
 * desbloqueadas. El `do update` con `where` corrige el caso de una categoria
 * que alguien desbloqueo a mano, sin tocar las que ya estan bien.
 */
async function asegurarCategoriasBloqueadas(
  runner: QueryRunner,
): Promise<number> {
  const afectadas = (await runner.query(
    `insert into precio_categoria (nombre, bloqueado)
     select t.nombre, true from unnest($1::text[]) as t(nombre)
     on conflict (nombre) do update set bloqueado = true
     where precio_categoria.bloqueado is distinct from true
     returning 1`,
    [CATEGORIAS_PRECIO_DEFAULT_LISTA],
  )) as unknown[];

  return afectadas.length;
}

/**
 * Deja un super_admin disponible y devuelve su id, que es el contexto de
 * auditoria de todo lo que se inserta despues.
 *
 * Es lo unico que corre fuera de `app_role`: `pc_usuario_insert` exige
 * `fc_es_super_admin()`, que necesita un `app.rol` que todavia no existe (huevo
 * y gallina), asi que la creacion va con el rol de bootstrap.
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
  // `uq_super_admin` cuenta tambien las filas borradas, pero un super_admin
  // dado de baja no sirve como contexto de auditoria. Se distinguen los dos
  // casos para no intentar un insert que el indice unico va a rechazar.
  const [{ activos, total }] = (await runner.query(
    `select
       count(*) filter (where deleted = false)::int as activos,
       count(*)::int as total
     from usuario where rol = 'super_admin'`,
  )) as { activos: number; total: number }[];

  if (activos > 0) {
    const [existente] = (await runner.query(
      `select id from usuario where rol = 'super_admin' and deleted = false
       order by fecha_creacion limit 1`,
    )) as { id: string }[];

    logger.log('Ya existe un super_admin: se usa como contexto de auditoria.');
    return { id: existente.id, creado: false };
  }

  if (total > 0) {
    logger.warn(
      'No se pudo crear el super: hay un super_admin marcado como borrado y ' +
        'uq_super_admin (indice unico parcial, incluye filas borradas) impide ' +
        'crear otro. Restauralo o cambialo a mano.',
    );
    return null;
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
 * Verifica que la auditoria acepte inserts.
 *
 * `auditoria` es FORCE RLS y su unica policy es de SELECT. Los inserts llegan
 * por `fc_auditoria`, que es SECURITY DEFINER y corre como su dueno: si ese rol
 * no es superusuario ni tiene BYPASSRLS, cada insert de catalogo muere con
 * "new row violates row-level security policy for table auditoria" y el error
 * aparece lejos de la causa. Se pregunta antes de tocar nada.
 */
async function auditoriaEscribible(runner: QueryRunner): Promise<boolean> {
  const filas = (await runner.query(
    `select coalesce(
       (select r.rolsuper or r.rolbypassrls
        from pg_proc p
        join pg_roles r on r.oid = p.proowner
        where p.oid = to_regprocedure('public.fc_auditoria()')),
       false
     ) as ok`,
  )) as { ok: boolean }[];

  return filas[0]?.ok === true;
}

/**
 * Pasa la conexion a `app_role` para el resto de la transaccion.
 *
 * De aca en adelante todo se inserta como lo haria la aplicacion: las policies
 * de RLS se evaluan de verdad y el catalogo queda auditado igual que en
 * produccion. Si el rol de bootstrap no puede asumirlo, el error de Postgres no
 * lo explica, asi que se reemplaza por uno propio.
 */
async function asumirRolApp(
  runner: QueryRunner,
  logger: Logger,
): Promise<void> {
  try {
    await runner.query(`set local role ${APP_ROLE}`);
  } catch (error) {
    throw new Error(
      `No pude asumir el rol "${APP_ROLE}" para cargar los datos iniciales. ` +
        `DB_BOOTSTRAP_USERNAME tiene que ser superusuario o miembro de ` +
        `"${APP_ROLE}". Detalle: ${(error as Error).message}`,
    );
  }

  logger.log(`Cargando los datos iniciales como "${APP_ROLE}".`);
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
    const runner = source.createQueryRunner();
    await runner.connect();

    try {
      // `fc_login` y el hash de contrasenas usan public.crypt / public.gen_salt.
      // El dump no crea la extension, asi que en una base nueva no existe y
      // nadie podria iniciar sesion. Va FUERA de la transaccion a proposito: si
      // falla (rol sin permisos, extension ya instalada en otro schema) la
      // transaccion no queda abortada y `asegurarSuperAdmin` avisa con precision
      // de que falta `public.crypt`.
      await runner
        .query('CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public')
        .catch((error: Error) => {
          logger.warn(
            `No pude instalar pgcrypto: ${error.message}. Sigo y verifico si ` +
              'public.crypt ya existe.',
          );
        });

      // Antes de abrir la transaccion: si la auditoria no acepta inserts, no hay
      // nada que hacer y se sale con un mensaje que nombra la causa real.
      if (!(await auditoriaEscribible(runner))) {
        logger.warn(
          'No se cargan los datos iniciales: el dueno de public.fc_auditoria ' +
            'no puede escribir en public.auditoria (FORCE RLS, sin policy de ' +
            'INSERT). DB_BOOTSTRAP_USERNAME tiene que ser superusuario o tener ' +
            'BYPASSRLS: es el rol que aplico el dump y por lo tanto el dueno ' +
            'de esa funcion.',
        );
        return;
      }

      await runner.query('BEGIN');

      try {
        // Unico paso fuera de `app_role`.
        const superAdmin = await asegurarSuperAdmin(runner, config, logger);

        if (!superAdmin) {
          // Sin usuario no hay contexto de auditoria: las policies y los triggers
          // de los catalogos tiran excepcion. Se corta sin romper el arranque.
          logger.warn(
            'No se cargan los datos iniciales: hace falta un usuario para el ' +
              'contexto de auditoria (app.user_id).',
          );
          await runner.query('COMMIT');
          return;
        }

        // Todo el catalogo corre como la aplicacion, con el super logueado.
        await asumirRolApp(runner, logger);

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
        const categorias = await asegurarCategoriasBloqueadas(runner);

        // Catalogo de libros. Solo entra si `libro` y `libro_completo` estan
        // vacias: en una base con datos propios no se agrega nada.
        const libros = await insertarLibrosDefault(runner);

        await runner.query('COMMIT');

        const insertados =
          niveles +
          componentes +
          materias +
          editoriales +
          especificaciones +
          categorias +
          libros.libros +
          libros.completos;

        if (libros.libros === 0 && libros.completos === 0) {
          logger.log(
            'Libros: la base ya tenia libros y libros completos, no se carga ' +
              'el catalogo por defecto.',
          );
        }

        if (insertados > 0) {
          logger.log(
            `Datos iniciales en "${database}": ${niveles} niveles, ` +
              `${componentes} componentes, ${materias} materias, ` +
              `${editoriales} editoriales, ${especificaciones} especificaciones, ` +
              `${categorias} categorias bloqueadas, ${libros.libros} libros, ` +
              `${libros.completos} libros completos.`,
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
