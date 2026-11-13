# DB schema bootstrap — crear el esquema al arrancar la API

## Objetivo

Que `yarn start` en `foto-api` deje la base lista para usar en una computadora nueva:
si el esquema no existe, lo crea desde cero (solo estructura, sin datos); si ya existe,
no toca nada.

## Problema

Hoy el esquema vive únicamente en `../DB/db_postrgres.sql`, un dump generado con
`pg_dump --schema-only`. Para levantar la API en otra máquina hay que abrir DataGrip (o
`psql`) y restaurarlo a mano antes del primer `yarn start`, porque TypeORM arranca con
`synchronize: false` y la conexión falla contra un schema vacío. El dump **no es
idempotente** (usa `CREATE TABLE`, no `CREATE TABLE IF NOT EXISTS`), así que correrlo dos
veces rompe.

## Por qué se produjo

El dump es un artefacto de restauración manual, no un bootstrap de aplicación. La API nunca
tuvo un paso de inicialización porque la base siempre se preparó antes, a mano.

## Decisión

Copiar el dump dentro de `foto-api` como asset y ejecutarlo desde `main.ts` **antes** de
`NestFactory.create`, sólo cuando el esquema está ausente.

**Fuente del esquema: `DB/db_postrgres.sql`, no `src/db.txt`.**

Se midió el contenido de ambos:

| Objeto | `DB/db_postrgres.sql` | `src/db.txt` |
| --- | --- | --- |
| Tablas | 31 | 31 |
| Vistas | 15 | 15 |
| Funciones | 63 | 63 |
| Policies | 85 | 85 |
| Grants | 67 | 67 |
| `ENABLE ROW LEVEL SECURITY` | sí | **0** |

`src/db.txt` no habilita RLS en ninguna tabla. Sin eso las 85 policies no se aplican y el
aislamiento por empresa que implementa `DbContextInterceptor` (vía el GUC `app.user_id`)
queda inerte. Además arranca con `create type tp_pedido_item as (...)` sin protección de
re-ejecución.

## Alcance

- **Sí**: `src/dataBase/schema.sql`, `src/dataBase/schema.bootstrap.ts`, `src/main.ts`,
  `nest-cli.json`.
- **No**: ningún archivo del repo `DB/`. El dump original no se toca ni se re-ejecuta.
- **No**: datos. El dump es `--schema-only`; las tablas quedan vacías.
- **No**: `synchronize: true`. Generaría tablas desde entidades y perdería vistas,
  funciones, triggers, policies y RLS.
- **No**: dependencias nuevas. `pg` ya está en `dependencies`.

## Restricciones conocidas

1. **Requiere PostgreSQL 17+.** El dump usa `SET transaction_timeout` (línea 45) y el
   privilegio `MAINTAIN` (línea 5242). El bootstrap valida `server_version_num` y aborta
   con un mensaje legible si la versión es menor.
2. **Requiere un rol con `CREATEROLE`/superusuario.** El dump hace `GRANT ... TO app_role`
   y `pg_dump --schema-only` no incluye roles, así que `app_role` hay que crearlo antes.
   Se lee de `DB_BOOTSTRAP_USERNAME` / `DB_BOOTSTRAP_PASSWORD`, con default `postgres` y
   `DB_PASSWORD`.

## Riesgos

- **Drift.** `src/dataBase/schema.sql` es una copia, no la fuente. Si `DB/db_postrgres.sql`
  cambia, la copia queda vieja en silencio. Mitigación: header con instrucción de recopia.
- **Ejecución sobre una base parcial.** Si hay tablas pero falta `public.usuario`, el
  bootstrap aborta en vez de aplicar el dump sobre un esquema a medio hacer.

## Tareas

- [x] **T1 — Copiar el dump como asset.**
      `src/dataBase/schema.sql`, copia byte a byte de `DB/db_postrgres.sql` (169.340 bytes).
      Criterio: `diff` sin diferencias contra el original. ✅ `diff` vacío.
      Ruta: inline (comando mecánico, sin diseño).

- [x] **T2 — Escribir `schema.bootstrap.ts`.**
      Detección de esquema vacío, creación de `app_role`, restore transaccional, verificación
      final y mensajes de error accionables.
      Criterio: `yarn build` sin errores de tipo. ✅ build limpio.
      Ruta: inline. Se resolvió inline porque el diseño quedó cerrado durante la exploración:
      delegarlo hubiera sido transcribir la especificación completa para que otro escriba el
      mismo código.

- [x] **T3 — Cablear en `app.module.ts` y copiar el asset en `nest-cli.json`.**
      `TypeOrmModule.forRootAsync` con `inject: [ConfigService]`, y `assets` para que el
      `.sql` llegue a `dist/`.
      Criterio: `dist/dataBase/schema.sql` existe después de `yarn build`. ✅ presente, 169.340 bytes.
      Ruta: inline (edición mecánica de 2 archivos).

      **Desvío respecto al plan original**: el plan decía enganchar en `main.ts` antes de
      `NestFactory.create`. No funciona: `ConfigModule.forRoot()` carga el `.env` *durante*
      la creación del módulo, así que en `main.ts` `process.env.DB_*` todavía está vacío y el
      bootstrap correría con defaults. Se movió al factory de TypeORM, que recibe el
      `ConfigService` ya hidratado.

- [x] **T4 — Verificación estática.**
      `yarn build` limpio, `npx tsc --noEmit` limpio, `eslint` limpio sobre los archivos tocados.
      Criterio: sin errores. ✅

## Hallazgos durante la implementación

1. **`CREATE SCHEMA public;` incondicional (línea 58 del dump).** En una base nueva `public`
   ya existe, así que restaurar el dump tal cual fallaba en la primera sentencia. Se
   reescribe a `CREATE SCHEMA IF NOT EXISTS public;` en memoria al cargarlo, sin tocar la
   copia, para que `diff` contra `DB/db_postrgres.sql` siga siendo limpio.
2. **`pg` no trae tipos y `@types/pg` no está instalado.** En vez de pedir una dependencia
   nueva, el bootstrap usa el `DataSource` de TypeORM (que ya trae tipos y usa `pg` por
   debajo). Sin parámetros, TypeORM delega en el protocolo simple de `pg`, que acepta el
   dump multi-sentencia en una sola llamada.

## Verificación

- `yarn start` sobre base vacía → crea el esquema y arranca.
- `yarn start` de nuevo → detecta el esquema existente y no toca nada.
- `yarn build` → `dist/dataBase/schema.sql` presente.

**No ejecutado contra la base.** Regla 1 de `db-guardian`: el bootstrap no se corre desde
esta sesión; lo corre el dueño al levantar la API.

## Rollback

Borrar `src/dataBase/schema.sql` y `src/dataBase/schema.bootstrap.ts`, revertir las
ediciones de `main.ts` y `nest-cli.json`. No hay efecto sobre la base hasta que se corra
`yarn start`.

## Progreso

Implementado y verificado estáticamente. **No ejecutado contra ninguna base**: el bootstrap
lo dispara el dueño al levantar la API.
