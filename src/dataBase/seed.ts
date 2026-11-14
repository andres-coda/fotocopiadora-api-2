import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryRunner } from 'typeorm';
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
 * Las policies de INSERT de los catalogos piden `fc_usuario_actual() IS NOT
 * NULL`, que en el arranque es NULL: por eso esto corre con el rol de bootstrap
 * (superusuario), que saltea RLS. Con `app_role` falla.
 */

const LOGGER_CONTEXT = 'DatabaseSeed';

/** `usuario.nombre` y `usuario.email` son varchar(50). */
const MAX_LARGO_USUARIO = 50;

/** Catalogos con UNIQUE(nombre): el conflicto alcanza para ser idempotente. */
type TablaConNombreUnico = 'nivel' | 'componente' | 'materia' | 'editorial';

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
 * `especificacion` es el unico catalogo sin UNIQUE(nombre), asi que el
 * `on conflict` no sirve: se pregunta antes.
 */
async function insertarEspecificaciones(runner: QueryRunner): Promise<number> {
  let nuevos = 0;

  for (const nombre of ESPECIFICACIONES_DEFAULT) {
    const insertadas = (await runner.query(
      `insert into especificacion (nombre)
       select $1
       where not exists (select 1 from especificacion where nombre = $1)
       returning id`,
      [nombre],
    )) as { id: string }[];

    nuevos += insertadas.length;
  }

  return nuevos;
}

/**
 * Garantiza las tres categorias bloqueadas.
 *
 * Devuelve cuantas se crearon. Si una categoria con ese nombre ya existia pero
 * quedo desbloqueada, la vuelve a marcar: el lateral de precios y la carga
 * inicial dependen de que esas tres esten bloqueadas.
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
     returning id`,
    [EMPRESA_DEFAULT.nombre, EMPRESA_DEFAULT.email, EMPRESA_DEFAULT.telefono],
  )) as { id: string }[];

  for (const precio of PRECIO_DEFAULT) {
    // `precio` es global (UNIQUE por nombre): se reusa si ya existe y despues
    // se vincula a la empresa en `precio_empresa` (PK id_empresa + id_precio).
    const [fila] = (await runner.query(
      `insert into precio (nombre, abreviatura) values ($1, $2)
       on conflict (nombre) do update set nombre = precio.nombre
       returning id`,
      [precio.nombre, precio.abreviatura ?? null],
    )) as { id: string }[];

    const [categoria] = (await runner.query(
      'select id from precio_categoria where nombre = $1',
      [precio.categoria],
    )) as { id: string }[];

    await runner.query(
      `insert into precio_empresa (id_empresa, id_precio, importe, id_categoria)
       values ($1, $2, $3, $4)`,
      [empresa.id, fila.id, precio.importe, categoria?.id ?? null],
    );
  }

  logger.log(
    `Empresa inicial "${EMPRESA_DEFAULT.nombre}" creada con ${PRECIO_DEFAULT.length} precios.`,
  );
}

/**
 * Crea el super admin desde `SUPER_USER` / `SUPER_MAIL` / `SUPER_PASS`.
 *
 * Nunca tumba el arranque: si faltan variables avisa y sigue. La base admite un
 * solo super_admin (`uq_super_admin` es un indice unico parcial sobre `rol`, y
 * cuenta tambien las filas borradas), asi que se pregunta antes de insertar.
 */
async function sembrarSuperAdmin(
  runner: QueryRunner,
  config: ConfigService,
  logger: Logger,
): Promise<void> {
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
    return;
  }

  if (nombre.length > MAX_LARGO_USUARIO || email.length > MAX_LARGO_USUARIO) {
    logger.warn(
      `No se pudo crear el super: SUPER_USER y SUPER_MAIL no pueden pasar de ` +
        `${MAX_LARGO_USUARIO} caracteres (largo de la tabla usuario).`,
    );
    return;
  }

  const [{ total }] = (await runner.query(
    `select count(*)::int as total from usuario where rol = 'super_admin'`,
  )) as { total: number }[];

  if (total > 0) {
    logger.log('Ya existe un super_admin: la base solo admite uno.');
    return;
  }

  await runner.query(
    `insert into usuario (nombre, email, password_hash, rol, id_empresa)
     values ($1, $2, public.crypt($3, public.gen_salt('bf', 10)), 'super_admin', null)`,
    [nombre, email, password],
  );

  logger.log(`super_admin "${nombre}" creado.`);
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
      await runner.query('BEGIN');

      try {
        // `fc_login` y el hash de contrasenas usan public.crypt /
        // public.gen_salt. El dump no crea la extension, asi que en una base
        // nueva no existe y nadie podria iniciar sesion. Se instala en `public`
        // porque las funciones del esquema la llaman calificada.
        await runner.query(
          'CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public',
        );

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
        const especificaciones = await insertarEspecificaciones(runner);
        const categorias = await asegurarCategoriasBloqueadas(runner, logger);

        await sembrarEmpresa(runner, logger);
        await sembrarSuperAdmin(runner, config, logger);

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
