import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { RequestContextService } from '../request-context.service';
import { Role } from '@src/auth/rol/rol.enum';

/**
 * El contexto de request se guarda en un AsyncLocalStorage:
 * - visible de forma sincronica dentro del callback de `run`
 * - invisible fuera del `run` (sin fugas entre requests)
 * - propagado a traves de `await`
 */
describe('RequestContextService', () => {
  let service: RequestContextService;

  beforeEach(() => {
    service = new RequestContextService();
  });

  afterEach(() => {
    // Cada test usa una instancia nueva, no hace falta limpiar el ALS.
  });

  it('expone el store de forma sincronica dentro de run', () => {
    service.run({ idUsuario: 'u-1', idEmpresa: 'emp-a', role: Role.Admin }, () => {
      expect(service.get()).toEqual({ idUsuario: 'u-1', idEmpresa: 'emp-a', role: Role.Admin });
    });
  });

  it('devuelve undefined fuera de cualquier run', () => {
    expect(service.get()).toBeUndefined();
    expect(service.idEmpresa).toBeUndefined();
    expect(service.role).toBeUndefined();
  });

  it('no deja fugas: get() vuelve a undefined cuando run termina', () => {
    const retorno = service.run({ idEmpresa: 'emp-a' }, () => {
      expect(service.get()).toEqual({ idEmpresa: 'emp-a' });
      return 'resultado';
    });

    expect(retorno).toBe('resultado');
    expect(service.get()).toBeUndefined();
    expect(service.idEmpresa).toBeUndefined();
  });

  it('los getters idEmpresa y role devuelven los valores del contexto', () => {
    service.run({ idEmpresa: 'emp-a', role: Role.Operador }, () => {
      expect(service.idEmpresa).toBe('emp-a');
      expect(service.role).toBe(Role.Operador);
    });

    expect(service.idEmpresa).toBeUndefined();
    expect(service.role).toBeUndefined();
  });

  it('propaga el contexto a traves de await (macrotask)', async () => {
    await service.run({ idEmpresa: 'emp-async' }, async () => {
      expect(service.get()).toEqual({ idEmpresa: 'emp-async' });

      await new Promise((resolve) => setTimeout(resolve, 1));

      expect(service.get()).toEqual({ idEmpresa: 'emp-async' });
      expect(service.idEmpresa).toBe('emp-async');
    });
  });

  it('no mezcla dos run concurrentes con contextos distintos', async () => {
    const lecturasA: Array<string | null | undefined> = [];
    const lecturasB: Array<string | null | undefined> = [];

    const cadena = async (almacen: typeof lecturasA, demora: number) => {
      for (let i = 0; i < 3; i++) {
        // Demoras distintas para forzar el intercalado de las dos cadenas
        await new Promise((resolve) => setTimeout(resolve, demora));
        almacen.push(service.idEmpresa);
      }
    };

    await Promise.all([
      service.run({ idEmpresa: 'a' }, () => cadena(lecturasA, 5)),
      service.run({ idEmpresa: 'b' }, () => cadena(lecturasB, 2)),
    ]);

    expect(lecturasA).toHaveLength(3);
    expect(lecturasB).toHaveLength(3);
    expect(lecturasA.every((valor) => valor === 'a')).toBe(true);
    expect(lecturasB.every((valor) => valor === 'b')).toBe(true);
    expect(service.get()).toBeUndefined();
  });

  it('un run anidado sobrescribe y luego restaura el contexto externo', () => {
    service.run({ idEmpresa: 'externa' }, () => {
      expect(service.idEmpresa).toBe('externa');

      service.run({ idEmpresa: 'interna' }, () => {
        expect(service.idEmpresa).toBe('interna');
      });

      expect(service.idEmpresa).toBe('externa');
    });

    expect(service.get()).toBeUndefined();
  });
});
