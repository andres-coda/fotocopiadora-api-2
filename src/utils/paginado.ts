import { BadRequestException } from '@nestjs/common';

export interface Paginado {
  pagina: number;
  limite: number;
  offset: number;
}

const LIMITE_DEFECTO = 20;

/**
 * Convierte `"3"` -> 3. Ausente o vacio -> `defecto`. Cualquier otra cosa
 * (texto, cero, negativo, decimal, parametro repetido) -> 400.
 */
const parsearEnteroPositivo = (
  valor: string | string[] | undefined,
  nombre: string,
  defecto: number,
): number => {
  if (Array.isArray(valor)) {
    throw new BadRequestException(`El parámetro '${nombre}' debe enviarse una sola vez`);
  }

  if (valor === undefined || valor.trim() === '') return defecto;

  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 1) {
    throw new BadRequestException(
      `El parámetro '${nombre}' debe ser un entero positivo (recibido: "${valor}")`,
    );
  }

  return numero;
};

/**
 * Normaliza y valida el paginado que llega por query string.
 *
 * Los valores de `@Query()` son strings en runtime aunque el decorador declare
 * un `number` con valor por defecto. Por eso un cliente podia mandar
 * `pagina=2undefined` y el controller lo convertia en `NaN`, caia al default y
 * respondia la pagina 1 otra vez: el front entraba en un loop pidiendo siempre
 * la misma pagina y el error quedaba invisible.
 *
 * Con esto un paginado invalido responde 400 en vez de disfrazarse de exito.
 */
export const parsearPaginado = (
  paginaQuery: string | string[] | undefined,
  limiteQuery: string | string[] | undefined,
  limiteDefecto: number = LIMITE_DEFECTO,
): Paginado => {
  const pagina = parsearEnteroPositivo(paginaQuery, 'pagina', 1);
  const limite = parsearEnteroPositivo(limiteQuery, 'limite', limiteDefecto);

  return { pagina, limite, offset: (pagina - 1) * limite };
};
