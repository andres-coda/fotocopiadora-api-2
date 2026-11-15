import { BadRequestException } from '@nestjs/common';
import { parsearPaginado } from '../paginado';

describe('parsearPaginado', () => {
  it('sin parámetros devuelve página 1, límite 20 y offset 0', () => {
    expect(parsearPaginado(undefined, undefined)).toEqual({ pagina: 1, limite: 20, offset: 0 });
  });

  it('convierte los strings de la query a números y calcula el offset', () => {
    expect(parsearPaginado('3', '15')).toEqual({ pagina: 3, limite: 15, offset: 30 });
  });

  it('respeta el límite por defecto que se le pasa (pedido_item pagina con 1000)', () => {
    expect(parsearPaginado(undefined, undefined, 1000)).toEqual({ pagina: 1, limite: 1000, offset: 0 });
  });

  it('un parámetro vacío cae al default en vez de fallar', () => {
    expect(parsearPaginado('', '')).toEqual({ pagina: 1, limite: 20, offset: 0 });
  });

  it.each([
    ['2undefined', 'el texto pegado que mandaba el front'],
    ['abc', 'texto no numérico'],
    ['0', 'cero no es una página válida'],
    ['-3', 'negativo'],
    ['1.5', 'decimal'],
    ['NaN', 'NaN literal'],
  ])('rechaza pagina=%s (%s)', (valor) => {
    expect(() => parsearPaginado(valor, '20')).toThrow(BadRequestException);
    expect(() => parsearPaginado(valor, '20')).toThrow(/parámetro 'pagina'/);
  });

  it('rechaza un límite inválido nombrando el parámetro correcto', () => {
    expect(() => parsearPaginado('1', '0')).toThrow(/parámetro 'limite'/);
  });

  it('rechaza un parámetro repetido en la query (llega como array)', () => {
    expect(() => parsearPaginado(['1', '2'], '20')).toThrow(/una sola vez/);
  });
});
