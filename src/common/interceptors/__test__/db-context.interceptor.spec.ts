import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Observable, firstValueFrom, from, of, throwError } from 'rxjs';
import { DbContextInterceptor } from '../db-context.interceptor';
import { RequestContextService } from '../../context/request-context.service';
import { Role } from '@src/auth/rol/rol.enum';

/** Deja correr microtasks + un macrotask (el tap async del interceptor no se espera). */
const flushAsync = async (): Promise<void> => {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
};

/** QueryRunner falso: todos sus metodos son jest.fn. */
const crearQueryRunner = () => ({
  connect: jest.fn(async (): Promise<void> => undefined),
  startTransaction: jest.fn(async (): Promise<void> => undefined),
  commitTransaction: jest.fn(async (): Promise<void> => undefined),
  rollbackTransaction: jest.fn(async (): Promise<void> => undefined),
  release: jest.fn(async (): Promise<void> => undefined),
  query: jest.fn(async (_sql: string, _params?: any[]): Promise<any> => undefined),
});

/** ExecutionContext falso que solo resuelve switchToHttp().getRequest(). */
const crearContexto = (request: any): any => ({
  switchToHttp: () => ({
    getRequest: () => request,
  }),
});

describe('DbContextInterceptor', () => {
  let requestContext: RequestContextService;
  let qR: ReturnType<typeof crearQueryRunner>;
  let interceptor: DbContextInterceptor;

  beforeEach(() => {
    requestContext = new RequestContextService();
    qR = crearQueryRunner();

    const dataSource = { createQueryRunner: jest.fn(() => qR) };

    interceptor = new DbContextInterceptor(dataSource as any, requestContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const usuario = { id: 'usuario-1', idEmpresa: 'emp-a', role: Role.Admin };

  it('setea el GUC app.user_id cuando request.user existe', async () => {
    const request: any = { user: usuario };
    const next: any = { handle: jest.fn((): Observable<string> => of('ok')) };

    const resultado = await firstValueFrom(interceptor.intercept(crearContexto(request), next));

    expect(resultado).toBe('ok');
    expect(qR.query).toHaveBeenCalledTimes(1);
    expect(qR.query).toHaveBeenCalledWith(
      `SELECT set_config('app.user_id', $1, true)`,
      ['usuario-1'],
    );
  });

  it('NO setea el GUC en rutas publicas (sin request.user)', async () => {
    const request: any = {};
    const next: any = { handle: jest.fn((): Observable<string> => of('ok')) };

    await firstValueFrom(interceptor.intercept(crearContexto(request), next));

    expect(qR.query).not.toHaveBeenCalled();
  });

  it('expone el QueryRunner en request.queryRunner', async () => {
    const request: any = { user: usuario };
    const next: any = { handle: jest.fn((): Observable<string> => of('ok')) };

    await firstValueFrom(interceptor.intercept(crearContexto(request), next));

    expect(request.queryRunner).toBe(qR);
  });

  it('REGRESION: el handler corre con el contexto ALS disponible', async () => {
    const request: any = { user: usuario };
    let capturado: any;

    const next: any = {
      handle: jest.fn(() =>
        from(
          (async () => {
            await new Promise((resolve) => setTimeout(resolve, 1));
            capturado = requestContext.get();
            return 'ok';
          })(),
        ),
      ),
    };

    const resultado = await firstValueFrom(interceptor.intercept(crearContexto(request), next));

    expect(resultado).toBe('ok');
    expect(capturado).toEqual({
      idUsuario: 'usuario-1',
      idEmpresa: 'emp-a',
      role: Role.Admin,
    });
  });

  it('no deja fugas: el contexto vuelve a undefined al terminar el request', async () => {
    const request: any = { user: usuario };
    const next: any = {
      handle: jest.fn(
        (): Observable<string> =>
          from(
            (async () => {
              await new Promise((resolve) => setTimeout(resolve, 1));
              return 'ok';
            })(),
          ),
      ),
    };

    expect(requestContext.get()).toBeUndefined();

    await firstValueFrom(interceptor.intercept(crearContexto(request), next));

    expect(requestContext.get()).toBeUndefined();
  });

  it('camino feliz: hace commit y release, nunca rollback', async () => {
    const request: any = { user: usuario };
    const next: any = { handle: jest.fn((): Observable<string> => of('ok')) };

    await firstValueFrom(interceptor.intercept(crearContexto(request), next));
    await flushAsync();

    expect(qR.connect).toHaveBeenCalledTimes(1);
    expect(qR.startTransaction).toHaveBeenCalledTimes(1);
    expect(qR.commitTransaction).toHaveBeenCalledTimes(1);
    expect(qR.release).toHaveBeenCalledTimes(1);
    expect(qR.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('camino de error: hace rollback y release', async () => {
    const request: any = { user: usuario };
    const next: any = {
      handle: jest.fn((): Observable<never> => throwError(() => new Error('boom'))),
    };

    await expect(
      firstValueFrom(interceptor.intercept(crearContexto(request), next)),
    ).rejects.toThrow('boom');

    // El tap.error es async: hay que dejar correr las promesas antes de assertar
    await flushAsync();

    expect(qR.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(qR.release).toHaveBeenCalledTimes(1);
    expect(qR.commitTransaction).not.toHaveBeenCalled();
  });
});
