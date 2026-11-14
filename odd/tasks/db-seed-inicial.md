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
| `especificacion` | los 10 valores del enum `Especificaciones` | `WHERE NOT EXISTS` (la tabla no tiene UNIQUE) |
| `precio_categoria` | las 3 bloqueadas de `CATEGORIAS_PRECIO_DEFAULT_LISTA` | `ON CONFLICT (nombre) DO UPDATE SET bloqueado = true` |
| `empresa` + `precio_empresa` | 1 empresa con los 10 precios de `PRECIO_DEFAULT` | solo si `empresa` está vacía |
| `usuario` | 1 `super_admin` desde `SUPER_USER`/`SUPER_MAIL`/`SUPER_PASS` | solo si no hay ningún `super_admin` |

Los valores viven en `seed.data.ts` y se editan sin tocar la lógica. Las categorías y los
precios **no** se duplican ahí: salen de `src/precio/default/precio.default.ts`, que ya es
la fuente de verdad.

## Restricciones de la base que condicionan el diseño

1. **`uq_super_admin` es un índice único parcial sobre `rol`** (`WHERE rol = 'super_admin'`).
   La base admite **un solo** super_admin en total, y el índice cuenta también las filas con
   `deleted = true`. Por eso el seed lee primero y no hace `ON CONFLICT`.
2. **Las policies de INSERT de catálogo exigen `fc_usuario_actual() IS NOT NULL`.** En el
   bootstrap no hay `app.user_id`, así que el seed solo funciona con el rol de bootstrap
   (superusuario, que saltea RLS). Con `app_role` falla.
3. **El dump no trae `CREATE EXTENSION pgcrypto`**, pero `fc_login` y el hash del super usan
   `public.crypt` / `public.gen_salt`. Sin la extensión no se puede hashear el super ni
   iniciar sesión. El seed la garantiza.
4. **`especificacion` no tiene UNIQUE(nombre)**, a diferencia de los otros catálogos.

## Tasks

- [x] **T1 — Datos en archivo aparte.** `seed.data.ts` con los cinco catálogos y la empresa
      inicial. Sin lógica, sin SQL.
      Criterio: solo arrays y un objeto; ningún `import` de TypeORM. ✅

- [x] **T2 — Seed idempotente.** `seed.ts` con un `QueryRunner` propio, un `BEGIN`/`COMMIT`
      y `ROLLBACK` en el `catch`.
      Criterio: correr dos veces seguidas no inserta ni modifica nada la segunda vez.
      ✅ Por construcción: `ON CONFLICT (nombre)`, `WHERE NOT EXISTS` para
      `especificacion`, y las compuertas de `empresa` y `super_admin`. Queda pendiente la
      comprobación en vivo contra una base real, que no se ejecutó.

- [x] **T3 — Super admin.** Lee `SUPER_USER`, `SUPER_MAIL`, `SUPER_PASS`.
      Si falta alguna: `No se pudo crear el super: variables inexistentes (...)`, y el
      arranque continúa. Si ya hay un super_admin: avisa y no inserta.
      Criterio: nunca tumba el arranque por una variable faltante. ✅

- [x] **T4 — Enganche en el arranque.** `app.module.ts` llama `ensureDatabaseSeed(config)`
      inmediatamente después de `ensureDatabaseSchema(config)`.
      Criterio: el seed corre antes de que exista el pool de TypeORM. ✅

- [x] **T5 — Verificación estática.** `npx tsc --noEmit` y `yarn build` limpios. ✅
      `npx eslint` sobre los cuatro archivos tocados, sin errores.

## Hallazgos

1. **`precio_empresa` tiene PK `(id_empresa, id_precio)`** y `precio` es global con
   `UNIQUE(nombre)`. El seed inserta el precio global y después el vínculo con la empresa.
2. **`empresa` tiene UNIQUE en `nombre`, `email` y `telefono`**, más `CHECK` de regex sobre
   email y teléfono (`^\+?[0-9]{10,}$`). Los valores de `seed.data.ts` respetan los dos.
3. **El front tiene `Especificaciones.SUELTO = 'suleto'`** en
   `foto-app/src/modelo/Entidades/especificacion/especificacion.enum.ts`, mientras la API y
   la base usan `'suelto'`. No se toca acá: se siembra `'suelto'`, el valor de la API. Queda
   anotado como defecto aparte.
