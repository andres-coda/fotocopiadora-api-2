# DB seed inicial — datos mínimos después de crear el esquema

## Objetivo

Que una base recién creada quede utilizable sin cargar nada a mano: los catálogos que el
front necesita para dar de alta un libro, las tres categorías de precio bloqueadas y el
usuario `super_admin`. **No** se crea ninguna empresa: la primera la da de alta el super
desde la app.

## Problema

`ensureDatabaseSchema` deja el esquema creado y **todas las tablas vacías**. Con la base
vacía:

- No se puede dar de alta un libro: `libro.id_materia` es NOT NULL y `fc_crear_libro`
  espera que existan nivel, materia, editorial y componente.
- El lateral de precios no muestra nada: las tres categorías bloqueadas viven en
  `precio_categoria` y nadie las crea hasta que nace una empresa.
- No se puede entrar al sistema: no existe ningún usuario.

## Decisión: transacción separada, no la del dump

El seed **no** comparte transacción con el dump por dos razones concretas:

1. Si comparten y falla el seed, hace rollback de **todo el esquema**. Un error de datos no
   debería costar las 31 tablas.
2. Si el dump commitea y el seed falla, el seed no vuelve a correr nunca: el bootstrap corta
   cuando ve `public.usuario` (`SENTINEL_TABLE`), así que la base quedaría con esquema y sin
   datos para siempre.

Por eso el seed corre **en cada arranque**, con su propia compuerta idempotente. Eso además
arregla una base que ya existe a medio poblar (el síntoma de la otra computadora).

## Decisión: solo el super_admin corre fuera de app_role

El único paso que usa el rol de bootstrap es la creación del `super_admin`. Todo el catálogo
se carga **después de `SET LOCAL ROLE app_role` y con el super en el contexto de auditoría**,
igual que un request real. No es cosmético:

1. Así el seed ejercita las policies de RLS de verdad. Si una policy se rompe, el arranque lo
   dice, en vez de pasar por arriba con un superusuario y fallar recién en producción.
2. `pc_especificacion_insert` es la única de las seis que exige `fc_es_super_admin()` en vez
   de `fc_usuario_actual() IS NOT NULL`. Sin el super logueado, `especificacion` no se puede
   poblar.

## Alcance

- **Sí**: `src/dataBase/seed.data.ts`, `src/dataBase/seed.ts`, `src/app.module.ts`,
  `src/dataBase/schema.bootstrap.ts` (exportar dos helpers).
- **No**: libros. `libro` exige `id_materia` y `libro_empresa.id_libro` apunta a
  `libro_completo`, no a `libro`; sembrar títulos sin edición ni empresa no produce nada
  visible en el buscador.
- **No**: empresa, `precio` ni `precio_empresa`. Una base nueva **no** genera empresa.
- **No**: usuarios admin de empresa. No hay credenciales para ellos en el entorno.
- **No**: archivos del repo `DB/`. El dump no se toca.
- **No**: dependencias nuevas.

## Datos iniciales

| Tabla | Qué se carga | Idempotencia | Instrucciones |
| --- | --- | --- | --- |
| `nivel` | 5 niveles | `ON CONFLICT (nombre)` | 1 |
| `componente` | 7 componentes | `ON CONFLICT (nombre)` | 1 |
| `materia` | 16 materias | `ON CONFLICT (nombre)` | 1 |
| `editorial` | 16 editoriales | `ON CONFLICT (nombre)` | 1 |
| `especificacion` | los 10 valores del enum `Especificaciones` | `ON CONFLICT (nombre)` (`uq_esp_nombre`) | 1 |
| `precio_categoria` | las 3 bloqueadas de `CATEGORIAS_PRECIO_DEFAULT_LISTA` | `ON CONFLICT (nombre) DO UPDATE SET bloqueado = true` | 1 |
| `usuario` | 1 `super_admin` desde `SUPER_USER`/`SUPER_MAIL`/`SUPER_PASS` | solo si no hay ningún `super_admin` | 1 |

Las seis tablas de catálogo tienen `UNIQUE (nombre)` (`uq_nivel_nombre`,
`uq_componente_nombre`, `uq_materia_nombre`, `uq_editorial_nombre`, `uq_esp_nombre`,
`uq_precio_categoria_nombre`). Eso permite que **una sola instrucción por tabla** cargue
todos los elementos y haga la verificación previa al mismo tiempo: `on conflict (nombre)`
deja el `SELECT` de existencia a cargo del índice único, sin round-trip extra y sin ventana
de carrera entre el chequeo y el insert.

Los valores viven en `seed.data.ts` y se editan sin tocar la lógica. Las categorías **no** se
duplican ahí: salen de `src/precio/default/precio.default.ts`, que ya es la fuente de verdad.

## Orden de ejecución

```
conexión bootstrap (DB_BOOTSTRAP_USERNAME)
  CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public   ← fuera de la transacción
  verificar que el dueño de fc_auditoria saltee RLS           ← fuera de la transacción
  BEGIN
  asegurarSuperAdmin()                                        ← lo ÚNICO fuera de app_role
  si no hay super → warn + COMMIT + return
  SET LOCAL ROLE app_role                                     ← de acá en adelante, todo
  set_config('app.user_id', <id del super>, true)
  1 instrucción por tabla (6 en total)
  COMMIT
```

Si algo falla, el `ROLLBACK` se lleva también al super: el arranque siguiente reintenta el
bloque completo. No queda media base sembrada.

`CREATE EXTENSION` va **fuera** de la transacción a propósito: si falla (rol sin permisos,
extensión ya instalada en otro schema) la transacción no queda abortada, y
`asegurarSuperAdmin` avisa con precisión de que falta `public.crypt` en vez de morir con
`current transaction is aborted`.

## Restricciones de la base que condicionan el diseño

1. **Nada se puede insertar sin `app.user_id`.** Los triggers de auditoría
   (`tr_nivel_auditoria`, `tr_componente_auditoria`, …) escriben `auditoria.id_usuario` NOT
   NULL con `fc_usuario_actual()` y `fc_auditoria` llama además `fc_empresa_actual()`, que
   hace `PERFORM fc_cargar_contexto_usuario()` y lanza `Usuario % no encontrado` cuando el
   GUC está vacío. **Por eso el super_admin se crea primero** (la tabla `usuario` no tiene
   trigger de auditoría en INSERT) y su id se publica con
   `set_config('app.user_id', ..., true)`. Sin esto, el primer `insert into nivel` falla.
2. **`auditoria` tiene FORCE ROW LEVEL SECURITY y su única policy es de SELECT**, pero eso
   **no** obliga a darle `BYPASSRLS` a `app_role`: el INSERT lo hace `fc_auditoria`, que es
   `SECURITY DEFINER` y corre como **su dueño**, o sea el rol que aplicó el dump
   (`DB_BOOTSTRAP_USERNAME`). `app_role` solo tiene `GRANT SELECT` sobre la tabla y nunca la
   toca de forma directa. **Consecuencia**: el dueño de `fc_auditoria` sí tiene que ser
   superusuario o tener `BYPASSRLS`. El seed lo verifica con `pg_proc.proowner` antes de
   abrir la transacción y, si no se cumple, avisa y no siembra.
3. **`pc_especificacion_insert` exige `fc_es_super_admin()`**, a diferencia de las otras
   cinco policies de catálogo, que se conforman con `fc_usuario_actual() IS NOT NULL`.
   `fc_es_super_admin()` lee `app.rol`, que carga `fc_cargar_contexto_usuario`. Es la razón
   por la que el catálogo se carga con el super y no con cualquier usuario.
4. **`SET LOCAL ROLE app_role` exige que el bootstrap sea superusuario o miembro de
   `app_role`.** `postgres` siempre puede. Un rol con solo `CREATEROLE` no es miembro
   automáticamente: el seed lo detecta y tira un error propio en vez de un
   `permission denied to set role` pelado.
5. **`uq_super_admin` es un índice único parcial sobre `rol`** (`WHERE rol = 'super_admin'`).
   La base admite **un solo** super_admin en total, y el índice cuenta también las filas con
   `deleted = true`. Por eso el seed lee primero y no hace `ON CONFLICT`, y distingue
   `activos` de `total`: un super_admin borrado no sirve como contexto de auditoría, pero
   tampoco deja crear otro. Ese estado se reporta, no se intenta forzar.
6. **`usuario` tiene `uk_email UNIQUE(email)`.** Si `SUPER_MAIL` ya pertenece a un
   admin/operador, el insert violaría el unique y, sin guarda, tumbaría el arranque en cada
   reinicio. El seed pregunta antes y avisa.
7. **`usuario.id_empresa` tiene `DEFAULT fc_empresa_actual()`.** El super_admin va con
   `id_empresa = null` explícito (`ck_super_admin_empresa` lo exige); si se omite, el default
   se evalúa sin contexto y falla.
8. **El dump no trae `CREATE EXTENSION pgcrypto`**, pero `fc_login` y el hash del super usan
   `public.crypt` / `public.gen_salt`. Sin la extensión no se puede hashear el super ni
   iniciar sesión. Después de crearla, el seed verifica
   `to_regprocedure('public.crypt(text,text)')` antes de intentar el hash: si `IF NOT EXISTS`
   fue un no-op porque la extensión vive en otro schema, avisa en vez de fallar con un error
   opaco.

## Tasks

- [x] **T1 — Datos en archivo aparte.** `seed.data.ts` con los cinco catálogos. Sin lógica,
      sin SQL.
      Criterio: solo arrays; ningún `import` de TypeORM. ✅

- [x] **T2 — Seed idempotente.** `seed.ts` con un `QueryRunner` propio, un `BEGIN`/`COMMIT`
      y `ROLLBACK` en el `catch`.
      Criterio: correr dos veces seguidas no inserta ni modifica nada la segunda vez.
      ✅ Por construcción: `ON CONFLICT (nombre)` en las seis tablas. Queda pendiente la
      comprobación en vivo contra una base real, que no se ejecutó.

- [x] **T3 — Super admin.** Lee `SUPER_USER`, `SUPER_MAIL`, `SUPER_PASS`.
      Si falta alguna: `No se pudo crear el super: variables inexistentes (...)`, y el
      arranque continúa. Si ya hay un super_admin: avisa y lo reusa como contexto.
      Criterio: nunca tumba el arranque por una variable faltante. ✅

- [x] **T4 — Enganche en el arranque.** `app.module.ts` llama `ensureDatabaseSeed(config)`
      inmediatamente después de `ensureDatabaseSchema(config)`.
      Criterio: el seed corre antes de que exista el pool de TypeORM. ✅

- [x] **T5 — Verificación estática.** `npx tsc --noEmit` y `yarn build` limpios. ✅
      `npx eslint` sobre los cuatro archivos tocados, sin errores.
      `npx jest`: 24/26 suites, las 2 fallas son las preexistentes (`gateway.gateway.spec.ts`,
      `user.controller.spec.ts`).

- [x] **T6 — Contexto de auditoría.** El super_admin se resuelve ANTES del catálogo y su id
      se publica con `set_config('app.user_id', $1, true)` en la misma transacción.
      Sin super_admin no se carga el catálogo: sin usuario, los triggers de auditoría lanzan
      `Usuario % no encontrado` y el arranque se caería.
      Criterio: el `insert into nivel` pasa con la auditoría en verde. ✅ por revisión del
      esquema; no se ejecutó contra una base.

- [x] **T7 — Catálogo como `app_role`.** Después del super, `SET LOCAL ROLE app_role`; si el
      bootstrap no puede asumir el rol, error propio nombrando `DB_BOOTSTRAP_USERNAME`.
      ✅

- [x] **T8 — Una instrucción por tabla.** `unnest($1::text[])` + `ON CONFLICT (nombre)`:
      6 round-trips en vez de 57 inserts fila por fila. `precio_categoria` fusiona alta y
      corrección en la misma sentencia con `DO UPDATE ... WHERE bloqueado IS DISTINCT FROM
      true`. ✅

- [x] **T9 — Guarda de auditoría.** Antes de abrir la transacción se verifica que el dueño de
      `fc_auditoria` (`pg_proc.proowner`) sea superusuario o tenga `BYPASSRLS`. Si no, se
      avisa y no se siembra, en vez de morir con un error de RLS lejos de la causa. ✅

## Hallazgos

1. **Los triggers de auditoría bloquean cualquier insert sin `app.user_id`.**
   `fc_auditoria` escribe `auditoria.id_usuario` (NOT NULL) con `fc_usuario_actual()` y llama
   `fc_empresa_actual()`, que a su vez hace `PERFORM fc_cargar_contexto_usuario()` y lanza
   `Usuario % no encontrado` si el GUC está vacío. Esto convierte al super_admin en
   precondición del seed, no en un extra.
2. **`fc_auditoria` es `SECURITY DEFINER` y el dump no tiene ni un `OWNER TO`** (`grep -c`
   → 0), así que el dueño es quien corrió el dump. El INSERT en `auditoria` corre como dueño
   y saltea el FORCE RLS; por eso `app_role` no necesita `BYPASSRLS` y le alcanza con el
   `GRANT SELECT`. Lo que sí importa es **quién es el dueño**: si el rol de bootstrap no
   saltea RLS, el trigger rechaza todos los inserts. El seed lo verifica antes de empezar.
3. **Sólo 3 de los 6 catálogos tienen trigger de auditoría** (`nivel`, `componente`,
   `materia`). `editorial`, `especificacion` y `precio_categoria` no lo tienen, pero sus
   policies llaman a las mismas funciones (`fc_usuario_actual()`, `fc_es_super_admin()`), así
   que el `app.user_id` sigue siendo obligatorio para los seis.
4. **`especificacion` sí tiene `uq_esp_nombre UNIQUE(nombre)`**, igual que los otros cinco
   catálogos: se unifica el tratamiento y se elimina el `WHERE NOT EXISTS` que había.
5. **`INSERT ... SELECT $1, $2 WHERE NOT EXISTS (...)` infiere los tipos por el `WHERE`**;
   sin ese `WHERE`, el driver falla con `could not determine data type of parameter $1`.
   Con `unnest($1::text[])` el cast explícito evita el problema de raíz.
6. **El front tiene `Especificaciones.SUELTO = 'suleto'`** en
   `foto-app/src/modelo/Entidades/especificacion/especificacion.enum.ts`, mientras la API y
   la base usan `'suelto'`. No se toca acá: se siembra `'suelto'`, el valor de la API. Queda
   anotado como defecto aparte.
7. **El seed no resucita catálogos con `deleted = true`.** `ON CONFLICT (nombre) DO NOTHING`
   deja la fila como está. Es deliberado: si alguien borró una materia desde la app, el
   arranque no debería volver a mostrarla. Consecuencia asumida: un default borrado no se
   restituye y su `UNIQUE(nombre)` tampoco deja recrearlo con ese mismo nombre a mano.
8. **Hallazgo colateral sin tocar:** `fc_login` hace
   `set_config('app.user_id', ..., false)` (no local), así que el GUC sobrevive al COMMIT en
   la conexión del pool y un request posterior sin JWT podría heredar ese usuario.
