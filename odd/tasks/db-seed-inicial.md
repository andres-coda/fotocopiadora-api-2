# DB seed inicial — datos mínimos después de crear el esquema

## Objetivo

Que una base recién creada quede utilizable sin cargar nada a mano: los catálogos que el
front necesita para dar de alta un libro, las tres categorías de precio bloqueadas, una
empresa inicial y el usuario `super_admin`.

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

## Alcance

- **Sí**: `src/dataBase/seed.data.ts`, `src/dataBase/seed.ts`, `src/app.module.ts`,
  `src/dataBase/schema.bootstrap.ts` (exportar dos helpers).
- **No**: libros. `libro` exige `id_materia` y `libro_empresa.id_libro` apunta a
  `libro_completo`, no a `libro`; sembrar títulos sin edición ni empresa no produce nada
  visible en el buscador.
- **No**: usuarios admin de la empresa inicial. No hay credenciales para ellos en el
  entorno.
- **No**: archivos del repo `DB/`. El dump no se toca.
- **No**: dependencias nuevas.

## Datos iniciales

| Tabla | Qué se carga | Idempotencia |
| --- | --- | --- |
| `nivel` | 5 niveles | `ON CONFLICT (nombre)` |
| `componente` | 7 componentes | `ON CONFLICT (nombre)` |
| `materia` | 16 materias | `ON CONFLICT (nombre)` |
| `editorial` | 16 editoriales | `ON CONFLICT (nombre)` |
| `especificacion` | los 10 valores del enum `Especificaciones` | `ON CONFLICT (nombre)` (`uq_esp_nombre`) |
| `precio_categoria` | las 3 bloqueadas de `CATEGORIAS_PRECIO_DEFAULT_LISTA` | `ON CONFLICT (nombre) DO UPDATE SET bloqueado = true` |
| `empresa` + `precio_empresa` | 1 empresa con los 10 precios de `PRECIO_DEFAULT` | solo si `empresa` está vacía |
| `usuario` | 1 `super_admin` desde `SUPER_USER`/`SUPER_MAIL`/`SUPER_PASS` | solo si no hay ningún `super_admin` |

Los valores viven en `seed.data.ts` y se editan sin tocar la lógica. Las categorías y los
precios **no** se duplican ahí: salen de `src/precio/default/precio.default.ts`, que ya es
la fuente de verdad.

## Restricciones de la base que condicionan el diseño

1. **Nada se puede insertar sin `app.user_id`.** Los triggers de auditoría
   (`tr_nivel_auditoria`, `tr_empresa_auditoria`, `tr_auditoria_lprecio`, …) escriben
   `auditoria.id_usuario` con `fc_usuario_actual()` y `fc_auditoria` llama además
   `fc_empresa_actual()`, que hace `PERFORM fc_cargar_contexto_usuario()` y lanza
   `Usuario % no encontrado` cuando el GUC está vacío. **Por eso el super_admin se crea
   primero** (la tabla `usuario` no tiene trigger de auditoría en INSERT) y su id se publica
   con `set_config('app.user_id', ..., true)`. Sin esto, el primer `insert into nivel` falla.
2. **`uq_super_admin` es un índice único parcial sobre `rol`** (`WHERE rol = 'super_admin'`).
   La base admite **un solo** super_admin en total, y el índice cuenta también las filas con
   `deleted = true`. Por eso el seed lee primero y no hace `ON CONFLICT`.
3. **`usuario` tiene `uk_email UNIQUE(email)`.** Si `SUPER_MAIL` ya pertenece a un
   admin/operador, el insert violaría el unique y, sin guarda, tumbaría el arranque en cada
   reinicio. El seed pregunta antes y avisa.
4. **`precio` tiene dos únicos: `nombre` y `abreviatura`.** Un `ON CONFLICT (nombre)` no
   cubre el caso de una fila que quedó con la misma abreviatura y otro nombre, así que se
   pregunta por los dos.
5. **El rol de bootstrap tiene que ser superusuario o BYPASSRLS.** No es por las
   policies de INSERT de catálogo (esas se cumplen con el GUC puesto; `componente` tiene
   `FORCE ROW LEVEL SECURITY` pero también tiene policy de INSERT). Es por **`auditoria`**:
   tiene `FORCE ROW LEVEL SECURITY` y su única policy es de SELECT (`pc_auditoria_select`),
   así que el INSERT de `fc_auditoria` solo pasa con un rol que saltee RLS. `CREATEROLE`
   alcanza para crear el esquema, no para el seed.
6. **El dump no trae `CREATE EXTENSION pgcrypto`**, pero `fc_login` y el hash del super usan
   `public.crypt` / `public.gen_salt`. Sin la extensión no se puede hashear el super ni
   iniciar sesión. El seed la crea y después verifica `to_regprocedure('public.crypt(text,text)')`
   antes de intentar el hash: si `IF NOT EXISTS` fue un no-op porque la extensión vive en
   otro schema, avisa en vez de fallar con un error opaco.

## Tasks

- [x] **T1 — Datos en archivo aparte.** `seed.data.ts` con los cinco catálogos y la empresa
      inicial. Sin lógica, sin SQL.
      Criterio: solo arrays y un objeto; ningún `import` de TypeORM. ✅

- [x] **T2 — Seed idempotente.** `seed.ts` con un `QueryRunner` propio, un `BEGIN`/`COMMIT`
      y `ROLLBACK` en el `catch`.
      Criterio: correr dos veces seguidas no inserta ni modifica nada la segunda vez.
      ✅ Por construcción: `ON CONFLICT (nombre)` en los cinco catálogos, y las compuertas
      de `empresa` y `super_admin`. Queda pendiente la comprobación en vivo contra una base
      real, que no se ejecutó.

- [x] **T3 — Super admin.** Lee `SUPER_USER`, `SUPER_MAIL`, `SUPER_PASS`.
      Si falta alguna: `No se pudo crear el super: variables inexistentes (...)`, y el
      arranque continúa. Si ya hay un super_admin: avisa y lo reusa como contexto.
      Criterio: nunca tumba el arranque por una variable faltante. ✅

- [x] **T6 — Contexto de auditoría.** El super_admin se resuelve ANTES del catálogo y su id
      se publica con `set_config('app.user_id', $1, true)` en la misma transacción.
      Sin super_admin no se carga el catálogo: sin usuario, los triggers de auditoría lanzan
      `Usuario % no encontrado` y el arranque se caería.
      Criterio: el `insert into nivel` pasa con la auditoría en verde. ✅ por revisión del
      esquema; no se ejecutó contra una base.

- [x] **T4 — Enganche en el arranque.** `app.module.ts` llama `ensureDatabaseSeed(config)`
      inmediatamente después de `ensureDatabaseSchema(config)`.
      Criterio: el seed corre antes de que exista el pool de TypeORM. ✅

- [x] **T7 — Guarda de rol y carreras.** Antes de abrir el runner se verifica
      `rolsuper or rolbypassrls` en `pg_roles`; si el rol no sirve, se avisa y se sale sin
      tocar la base. Los tres `count` + `insert` (`empresa`, `precio`, `super_admin`) llevan
      `ON CONFLICT DO NOTHING` y manejan la fila vacía.
      Criterio: un rol mal configurado da un mensaje propio, no un error de RLS opaco. ✅

- [x] **T5 — Verificación estática.** `npx tsc --noEmit` y `yarn build` limpios. ✅
      `npx eslint` sobre los cuatro archivos tocados, sin errores.
      `npx jest`: 24/26 suites, las 2 fallas son las preexistentes (`gateway.gateway.spec.ts`,
      `user.controller.spec.ts`).

## Hallazgos

1. **Los triggers de auditoría bloquean cualquier insert sin `app.user_id`.**
   `fc_auditoria` escribe `auditoria.id_usuario` (NOT NULL) con `fc_usuario_actual()` y llama
   `fc_empresa_actual()`, que a su vez hace `PERFORM fc_cargar_contexto_usuario()` y lanza
   `Usuario % no encontrado` si el GUC está vacío. Esto convierte al super_admin en
   precondición del seed, no en un extra.
2. **`precio_empresa` tiene PK `(id_empresa, id_precio)`** y `precio` es global con
   `UNIQUE(nombre)` **y** `UNIQUE(abreviatura)`. El seed inserta el precio global y después
   el vínculo con la empresa.
3. **`empresa` tiene UNIQUE en `nombre`, `email` y `telefono`**, más `CHECK` de regex sobre
   email y teléfono (`^\+?[0-9]{10,}$`). Los valores de `seed.data.ts` respetan los dos.
   Además `tr_empresa_config_insert` crea la fila de `configuraciones` sola.
4. **El front tiene `Especificaciones.SUELTO = 'suleto'`** en
   `foto-app/src/modelo/Entidades/especificacion/especificacion.enum.ts`, mientras la API y
   la base usan `'suelto'`. No se toca acá: se siembra `'suelto'`, el valor de la API. Queda
   anotado como defecto aparte.
5. **El seed no resucita catálogos con `deleted = true`.** `ON CONFLICT (nombre) DO NOTHING`
   deja la fila como está. Es deliberado: si alguien borró una materia desde la app, el
   arranque no debería volver a mostrarla.
