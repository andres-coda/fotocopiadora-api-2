# Back suite verde — reconstrucción de la suite de tests de foto-api

## Objetivo

Dejar la suite de Jest de `foto-api` entera en verde, con cobertura real y consciente de
cada módulo, partiendo de cero sobre las 18 suites que estaban comentadas.

## Problema

De 28 suites, 24 fallaban y ninguna por un defecto de la aplicación:

- **18 suites** no ejecutaban ni un test (`Your test suite must contain at least one test`):
  estaban envueltas en `/* ... */`. Contenían **230 tests** en ~5.000 líneas.
  Se silenciaron el 2026-07-05 en `572ca0d` y `8fab52a` agregando dos líneas por archivo.
- **6 suites** (`nivel`, `editorial`, `empresa` — controller y service) son el andamiaje
  de `nest g`, nunca tocado: fallan porque el `TestingModule` no provee `AuthService`
  (que pide `UsuarioGuard`) ni `getRepositoryToken`, `DataSource`, `ErroresService`,
  `GatewayGateway`.

## Por qué se produjo

La adaptación a la base de datos renombró campos de entidad a snake_case
(`idLibro` → `id_libro`, `idPrecio` → `id_precio`, se agregó `id_empresa`) y cambió los
constructores de los servicios. Los specs se adaptaron, pero los fixtures compartidos de
`test/mock/` no: hoy 8 de los 10 errores de `tsc` del repo están ahí.

`isolatedModules: true` en `tsconfig.json` hace que ts-jest **no typechequee**, así que ese
desfase no aparecía como error de tipo: aparecía como una aserción roja en un test que
parecía mal escrito. Eso llevó a comentar en vez de arreglar.

## Decisión

**Borrar las 18 y reconstruir desde el código actual.** No se restauran: se lee el
inventario de `it(...)` de cada una para no perder los escenarios que alguien ya pensó, y
se escriben asserts nuevos contra el comportamiento vigente.

## Alcance

- **Sí**: `src/**/*.spec.ts` y `test/mock/*.ts`.
- **No**: ningún archivo de producción bajo `src/` (salvo que un test revele un bug real,
  que se reporta antes de tocar nada).
- **No**: dependencias nuevas.

## Tareas

- [ ] **T1 — Fundación: mocks contra las entidades actuales.**
      Corregir `test/mock/*.ts` (esp, libro, libro_pedido, precio, propuesta, base, test).
      Criterio: `npx tsc --noEmit -p tsconfig.json` sin errores en `test/`.

- [ ] **T2 — Borrar las 18 suites comentadas.**
      Antes de borrar cada una, registrar el inventario de escenarios en esta ficha.
      Criterio: `npx jest` deja 4 suites verdes y 6 rojas (categoría B).

- [ ] **T3 — Template: `componente.service.spec.ts`.**
      Escrito de cero contra el código actual. Es el patrón modal (repo + DataSource +
      ErroresService + GatewayGateway) y la referencia para el resto.
      Criterio: suite verde y typecheck limpio.

- [ ] **T4 — Servicios simples:** `error`, `sede`, `materia`, `precio`, `especificacion`.

- [ ] **T5 — Servicios con dependencias cruzadas:** `libro`, `pedido`, `cliente`,
      `propuesta_pedido`, `libro_pedido`.

- [ ] **T6 — Controllers:** `user`, `libro_pedido`, `auth`.

- [ ] **T7 — Base:** `base.service`, `base.controller`.

- [ ] **T8 — Categoría B:** `nivel`, `editorial`, `empresa` (controller + service).

## Criterios de aceptación

1. `npx jest` → 0 suites fallando.
2. `npx tsc --noEmit -p tsconfig.json` → 0 errores en `src/` y `test/`.
3. `npm run build` → verde (usa `tsconfig.build.json`, que excluye specs).
4. Ningún archivo de producción modificado sin reportarlo antes.

## Reglas de trabajo

- Verde + typecheck por lote, **un commit por lote** (conventional commits, sin atribución).
- Si un escenario del inventario ya no aplica al comportamiento actual, se deja fuera y se
  documenta por qué; **nunca** se debilita una aserción para que pase.
- Si un test revela un bug de producción, se reporta y se decide antes de tocar `src/`.

## Progreso

- Inventario de escenarios recuperado: 230 tests en 18 suites.
- Confirmado que `test/mock/*` solo lo consumen los specs (nada de producción lo importa).
- Decisión del usuario: borrar y reconstruir (no restaurar).
