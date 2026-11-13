import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

/**
 * Bootstrap del esquema de la base de datos.
 *
 * Corre una sola vez, antes de que TypeORM abra el pool de la aplicacion: si
 * el esquema no existe lo crea desde `schema.sql`, y si ya existe no toca nada.
 *
 * `schema.sql` es una copia byte a byte de `DB/db_postgres.sql` (dump
 * `--schema-only`). Sin datos: las tablas quedan vacias. Si el dump original
 * cambia, hay que recopiar el archivo; no se edita a mano.
 *
 * REQUISITOS
 *   - PostgreSQL 17 o superior. El dump usa `SET transaction_timeout` y el
 *     privilegio `MAINTAIN`, ambos de PG 17.
 *   - Un rol con CREATEROLE o superusuario (`DB_BOOTSTRAP_USERNAME`), porque
 *     el dump hace GRANT sobre `app_role` y un dump `--schema-only` no incluye
 *     la creacion de roles.
 *
 * POR QUE NO ALCANZA CON EJECUTAR EL DUMP TAL CUAL
 *   El dump emite `CREATE SCHEMA public;` sin condicion. En una base nueva ese
 *   schema ya existe, asi que la restauracion falla en la primera sentencia.
 *   Se reescribe a `CREATE SCHEMA IF NOT EXISTS public;` al cargarlo, en vez de
 *   editar la copia, para que el archivo siga siendo comparable con el original.
 */

const APP_ROLE = 'app_role';
const SENTINEL_TABLE = 'public.usuario';
const MIN_SERVER_VERSION = 170000; // PostgreSQL 17
const MAINTENANCE_DB = 'postgres';
const SCHEMA_FILE = 'schema.sql';
const LOGGER_CONTEXT = 'DatabaseBootstrap';

/** Escapa un identificador para interpolarlo en DDL. */
function quoteIdent(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function readNumber(
  config: ConfigService,
  key: string,
  fallback: number,
): number {
  const raw = config.get<string>(key);
  const parsed = Number.parseInt(raw ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function readSsl(config: ConfigService): PostgresConnectionOptions['ssl'] {
  return config.get<string>('DB_SSL') === 'true'
    ? { rejectUnauthorized: false }
    : false;
}

function readDatabase(config: ConfigService): string {
  return config.get<string>('DB_NAME') || 'fotocopiadora';
}

/** Credenciales privilegiadas: solo se usan para crear rol y esquema. */
function bootstrapCredentials(config: ConfigService) {
  return {
    username: config.get<string>('DB_BOOTSTRAP_USERNAME') || 'postgres',
    password:
      config.get<string>('DB_BOOTSTRAP_PASSWORD') ??
      config.get<string>('DB_PASSWORD') ??
      '',
  };
}

function buildDataSource(config: ConfigService, database: string): DataSource {
  const { username, password } = bootstrapCredentials(config);

  return new DataSource({
    type: 'postgres',
    host: config.get<string>('DB_HOST') || 'localhost',
    port: readNumber(config, 'DB_PORT', 5432),
    username,
    password,
    database,
    ssl: readSsl(config),
    entities: [],
    synchronize: false,
    // El dump son 169 KB: loguearlo entero no aporta y ensucia la salida.
    logging: false,
  });
}

/**
 * Busca `schema.sql` junto al modulo compilado (dist/dataBase) y, si no esta,
 * en el arbol de fuentes.
 */
function resolveSchemaPath(): string {
  const candidates = [
    join(__dirname, SCHEMA_FILE),
    join(process.cwd(), 'src', 'dataBase', SCHEMA_FILE),
  ];

  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      `No encontre ${SCHEMA_FILE}. Rutas probadas:\n  ${candidates.join('\n  ')}`,
    );
  }

  return found;
}

/** Carga el dump y lo deja idempotente en el unico punto que lo necesita. */
function loadSchemaSql(): string {
  const path = resolveSchemaPath();
  const original = readFileSync(path, 'utf8');

  const idempotent = original.replace(
    'CREATE SCHEMA public;',
    'CREATE SCHEMA IF NOT EXISTS public;',
  );

  if (idempotent === original) {
    new Logger(LOGGER_CONTEXT).warn(
      `${path} no contiene "CREATE SCHEMA public;": se ejecuta sin reescribir.`,
    );
  }

  return idempotent;
}

/** Crea la base si el rol de bootstrap tiene permiso y no existe. */
async function ensureDatabaseExists(
  config: ConfigService,
  database: string,
  logger: Logger,
): Promise<void> {
  if (database === MAINTENANCE_DB) {
    return;
  }

  const admin = buildDataSource(config, MAINTENANCE_DB);
  await admin.initialize();

  try {
    const existing = await admin.query<{ count: string }[]>(
      'SELECT count(*)::text AS count FROM pg_database WHERE datname = $1',
      [database],
    );

    if (Number(existing[0].count) === 0) {
      logger.log(`Creando base de datos "${database}"...`);
      try {
        await admin.query(`CREATE DATABASE ${quoteIdent(database)}`);
      } catch (error) {
        throw new Error(
          `No pude crear la base "${database}". El rol de bootstrap necesita CREATEDB. ` +
            `Detalle: ${(error as Error).message}`,
        );
      }
    }
  } finally {
    await admin.destroy();
  }
}

/** Crea `app_role` si falta. El dump le hace GRANT y no viene incluido en el. */
async function ensureAppRole(
  source: DataSource,
  password: string,
  logger: Logger,
): Promise<void> {
  const existing = await source.query<{ ok: number }[]>(
    'SELECT 1 AS ok FROM pg_roles WHERE rolname = $1',
    [APP_ROLE],
  );

  if (existing.length > 0) {
    return;
  }

  try {
    await source.query(`CREATE ROLE ${quoteIdent(APP_ROLE)} LOGIN`);

    // `ALTER ROLE ... PASSWORD` no acepta parametros: se arma con format() del
    // lado del servidor para no escapar la contrasena a mano.
    const formatted = await source.query<{ stmt: string }[]>(
      `SELECT format('ALTER ROLE ${quoteIdent(APP_ROLE)} PASSWORD %L', $1) AS stmt`,
      [password],
    );
    await source.query(formatted[0].stmt);

    logger.log(`Rol "${APP_ROLE}" creado.`);
  } catch (error) {
    throw new Error(
      `No pude crear el rol "${APP_ROLE}". El rol de bootstrap necesita CREATEROLE. ` +
        `Detalle: ${(error as Error).message}`,
    );
  }
}

/**
 * Garantiza que el esquema exista. Idempotente: si `public.usuario` ya
 * responde, retorna sin ejecutar nada.
 */
export async function ensureDatabaseSchema(
  config: ConfigService,
): Promise<void> {
  const logger = new Logger(LOGGER_CONTEXT);
  const database = readDatabase(config);

  await ensureDatabaseExists(config, database, logger);

  const source = buildDataSource(config, database);
  await source.initialize();

  try {
    const version = await source.query<{ v: number }[]>(
      `SELECT current_setting('server_version_num')::int AS v`,
    );
    if (version[0].v < MIN_SERVER_VERSION) {
      throw new Error(
        `Se requiere PostgreSQL 17 o superior (servidor actual: ${version[0].v}). ` +
          'El esquema usa objetos que no existen en versiones anteriores.',
      );
    }

    const state = await source.query<
      { has_sentinel: boolean; table_count: string }[]
    >(
      `SELECT to_regclass($1) IS NOT NULL AS has_sentinel,
              (SELECT count(*) FROM pg_tables WHERE schemaname = 'public')::text AS table_count`,
      [SENTINEL_TABLE],
    );

    if (state[0].has_sentinel) {
      logger.log('Esquema ya presente: no se ejecuta ningun cambio.');
      return;
    }

    const tableCount = Number(state[0].table_count);
    if (tableCount > 0) {
      throw new Error(
        `La base "${database}" tiene ${tableCount} tablas en public pero falta ${SENTINEL_TABLE}. ` +
          'El esquema esta a medio crear: revisalo a mano antes de volver a arrancar. ' +
          'Aplicar el dump encima dejaria un estado inconsistente.',
      );
    }

    logger.log(`Base "${database}" vacia. Creando esquema...`);

    const schemaSql = loadSchemaSql();

    await ensureAppRole(
      source,
      config.get<string>('DB_PASSWORD') ?? '',
      logger,
    );

    // Sin parametros, TypeORM delega en el protocolo simple de pg y acepta
    // varias sentencias en una sola llamada: el dump entra como una unidad.
    await source.query('BEGIN');
    try {
      await source.query(schemaSql);

      const check = await source.query<{ ok: boolean }[]>(
        `SELECT to_regclass($1) IS NOT NULL AS ok`,
        [SENTINEL_TABLE],
      );
      if (!check[0].ok) {
        throw new Error(
          `${SENTINEL_TABLE} no quedo creada despues de aplicar el esquema.`,
        );
      }

      await source.query('COMMIT');
    } catch (error) {
      await source.query('ROLLBACK');
      throw error;
    }

    logger.log(`Esquema creado en "${database}" (sin datos).`);
  } finally {
    await source.destroy();
  }
}
