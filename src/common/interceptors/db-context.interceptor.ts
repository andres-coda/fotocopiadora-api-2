import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { Observable, from, switchMap, tap } from 'rxjs';

/**
 * Interceptor global que envuelve cada request HTTP en una transacción
 * PostgreSQL e inyecta el user_id como GUC de sesión (app.user_id).
 *
 * Esto permite que el Row-Level Security de la BD filtre automáticamente
 * los datos por empresa sin que los servicios tengan que pasarlo
 * explícitamente en cada consulta.
 *
 * El GUC se setea con is_local = true, lo que significa que dura
 * únicamente hasta el COMMIT/ROLLBACK de esta transacción.
 * Así se evita el filtrado cruzado en conexiones pooladas.
 *
 * Rutas públicas (sin JWT, ej: POST /auth/login): como req.user?.id
 * será undefined, el interceptor no setea el GUC pero igual crea
 * la transacción. Si preferís saltear la transacción en rutas públicas,
 * podés agregar un decorador @Public() y chequearlo acá.
 */
@Injectable()
export class DbContextInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return from(this.iniciarTransaccion(request)).pipe(
      switchMap((qR) => {
        return next.handle().pipe(
          // Si el handler termina bien → commit
          tap({
            next: async () => {
              await qR.commitTransaction();
              await qR.release();
            },
            error: async () => {
              await qR.rollbackTransaction();
              await qR.release();
            },
          }),
        );
      }),
    );
  }

  private async iniciarTransaccion(request: any): Promise<QueryRunner> {
    const qR = this.dataSource.createQueryRunner();
    await qR.connect();
    await qR.startTransaction();

    // Inyectar el contexto de usuario como GUC local a la transacción
    const userId: string | undefined = request.user?.id;
    if (userId) {
      // is_local = true → el GUC se descarta al hacer COMMIT o ROLLBACK
      await qR.query(`SELECT set_config('app.user_id', $1, true)`, [userId]);
    }

    // Exponemos el QueryRunner en el request para que los servicios
    // puedan usarlo cuando necesiten operar dentro de esta misma transacción
    request.queryRunner = qR;

    return qR;
  }
}
