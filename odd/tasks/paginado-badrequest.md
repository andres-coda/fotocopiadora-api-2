# Paginado: 400 en vez de degradar a página 1

**Estado**: cerrado (commit de la unidad de trabajo)
**Repo**: `foto-api`
**Origen**: el bug `pagina=2undefined` que dejó el paginado de libro completo en un loop invisible.

## Objetivo

Que un `pagina` / `limite` inválido en cualquier endpoint paginado responda **400** con el
nombre del parámetro, en vez de convertirse en silencio en página 1.

## Problema

Los controllers declaran `@Query('pagina') pagina = 1`. Ese `= 1` es un valor por defecto de
**JavaScript**, no una conversión: TypeScript infiere `number` y el tipo miente, porque en
runtime el valor que llega es el string de la query.

Con ese tipo mentiroso, cada controller inventó su propia conversión:

- `const pagina: number = pg > 0 ? Number(pg) : 1;` — `pg > 0` compara **string contra
  número**: `"2" > 0` es `true` por coerción, pero `"2undefined" > 0` es `false`. El
  resultado es `NaN` disfrazado de página 1.
- `const offset = (pagina - 1) * limite;` funciona de casualidad por coerción de strings.
- Algunos hacen `Number(limite)` al llamar al service y otros no, así que el mismo parámetro
  viaja como número o como string según el archivo.

El costo se vio en `libro/completo`: el front mandó `pagina=2undefined` y el controller
respondió `"pagina": 1` otra vez. El front no podía distinguir "no hay más páginas" de "tu
parámetro está mal", así que volvió a pedir la página 2 hasta agotar el scroll.

## Decisión

Un único helper `parsearPaginado` en `src/utils/paginado.ts` que devuelve
`{ pagina, limite, offset }` ya numéricos:

- ausente o vacío → default (`pagina` 1, `limite` 20 o el que reciba por parámetro);
- presente y no entero positivo → `BadRequestException` 400;
- `pagina` o `limite` repetidos en la query → 400 (llegan como array).

Sin tope de `limite`: `pedido_item` pagina con default 1000 legítimamente.

## Alcance

- **Sí**: `src/utils/paginado.ts` (nuevo) y los controllers con `@Query('pagina')` /
  `@Query('limite')`.
- **No**: servicios, DTOs, entidades, rutas, esquema SQL, front.
- **No**: agregar un `ValidationPipe` global; el cambio es por endpoint, explícito.

## Contrato del helper

```ts
parsearPaginado(paginaQuery?, limiteQuery?, limiteDefecto = 20): { pagina, limite, offset }
```

Los decoradores pasan a `@Query('pagina') paginaQuery: string | undefined` **sin** default,
porque el default ahora lo aplica el helper.

## Tareas

- [x] **T1 — Helper.** `src/utils/paginado.ts` con `parsearPaginado` y su validador privado.
      Criterio: `npx tsc --noEmit` limpio (el archivo compila aislado).

- [x] **T2 — Controllers con búsqueda.** Reemplazar la conversión ad hoc por el helper en
      `base`, `cliente`, `componente`, `dato_cobro` (2 sitios), `editorial`, `empresa`,
      `libro` (3), `materia` (2), `mensaje` (2), `nivel`, `pedido` (2), `pedido_item` (3),
      `precio`, `precio_categoria`, `precio_empresa`, `propuesta_pedido`, `solicitud`,
      `user` (2).
      Criterio: no queda ningún `pg > 0`, ni `pagDto`, ni `Number(limite)` / `Number(offset)`
      en controllers; `npx tsc --noEmit` limpio.

- [x] **T3 — Verificación.** `npx tsc --noEmit` limpio y `npm test` (jest) sin regresiones.
      Criterio: la suite queda verde (o igual que la línea base) y `git diff` no toca nada
      fuera de `src/**/*.controller.ts` + `src/utils/paginado.ts`.

- [x] **T4 — Commit de unidad de trabajo.** 22 archivos, +320/−130.

## Rutas y delegación

| Tarea | Ruta | Evidencia del trigger |
| --- | --- | --- |
| T1 | inline | un archivo nuevo, contrato ya decidido, sin investigación |
| T2 | delegada (`general`) | 18 controllers no triviales = writer trigger |
| T3 | inline (comandos) | verificación de la unidad de trabajo |
| T4 | inline | `git commit` de la unidad |

TDD: no configurado para este repo en esta sesión; se corren los checks funcionales
(`tsc` + `jest`) al cerrar la tarea.

## Verificación

| Check | Resultado |
| --- | --- |
| `npx tsc --noEmit` (línea base, antes de tocar) | limpio |
| `npx tsc --noEmit` (después) | limpio, `TSC_EXIT=0` |
| `grep "pg > 0\|pagDto\|Number(limite)\|Number(offset)\|Number(pagina)\|limiteNum"` en controllers | sin coincidencias |
| `@Query('pagina')` vs `parsearPaginado(` | 27 vs 27, por archivo coinciden |
| `npx jest src/utils/__test__/paginado.spec.ts` | 12/12 |
| `npm test` | 25 suites verdes, 2 rojas preexistentes (`user.controller`, `gateway.gateway`: falta `AuthService` en el `TestingModule`), 106/108 tests |

## Pendiente fuera de alcance

- `src/db.txt` quedó modificado en el working tree y **no** entró en el commit: el diff es de
  dominios ajenos (`pc_precio_categoria_select`, `vw_libro_completo` con 13 columnas) y no lo
  generó este cambio.
