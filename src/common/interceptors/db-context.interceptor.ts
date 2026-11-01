import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { Observable, from, switchMap, tap } from 'rxjs';
import { RequestContext, RequestContextService } from '../context/request-context.service';

/**
 * Interceptor global que envuelve cada request HTTP en una transaccion
 * PostgreSQL e inyecta el user_id como GUC de sesion (app.user_id).
 *
 * Esto permite que el Row-Level Security de la BD filtre automaticamente
 * los datos por empresa sin que los servicios tengan que pasarlo
 * explicitamente en cada consulta.
 *
 * El GUC se setea con is_local = true, lo que significa que dura
 * unicamente hasta el COMMIT/ROLLBACK de esta transaccion.
 * Asi se evita el filtrado cruzado en conexiones pooladas.
 *
 * Ademas publica el actor autenticado en un `AsyncLocalStorage` para que
 * capas sin acceso al `request` (por ejemplo el gateway de sockets) sepan
 * de que empresa es quien ejecuta la accion.
 *
 * Rutas publicas (sin JWT, ej: POST /auth/login): como req.user?.id
 * sera undefined, el interceptor no setea el GUC pero igual crea
 * la transaccion. Si preferis saltear la transaccion en rutas publicas,
 * podes agregar un decorador @Public() y chequearlo aca.
 */
@Injectable()
export class DbContextInterceptor implements NestInterceptor {
  constructor(
    private readonly dataSource: DataSource,
    private readonly requestContext: RequestContextService,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const contexto: RequestContext = {
      idUsuario: request.user?.id,
      idEmpresa: request.user?.idEmpresa ?? null,
      role: request.user?.role,
    };

    return new Observable((subscriber) => {
      // La suscripcion tiene que ocurrir DENTRO del contexto: el handler del
      // controller recien se ejecuta al suscribirse, y a partir de ahi el
      // AsyncLocalStorage se propaga por toda la cadena async del servicio.
      const suscripcion = this.requestContext.run(contexto, () =>
        from(this.iniciarTransaccion(request))
          .pipe(
            switchMap((qR) =>
              next.handle().pipe(
                // Si el handler termina bien -> commit
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
              ),
            ),
          )
          .subscribe(subscriber),
      );

      return () => suscripcion.unsubscribe();
    });
  }

  private async iniciarTransaccion(request: any): Promise<QueryRunner> {
    const qR = this.dataSource.createQueryRunner();
    await qR.connect();
    await qR.startTransaction();

    // Inyectar el contexto de usuario como GUC local a la transaccion
    const userId: string | undefined = request.user?.id;
    if (userId) {
      // is_local = true -> el GUC se descarta al hacer COMMIT o ROLLBACK
      await qR.query(`SELECT set_config('app.user_id', $1, true)`, [userId]);
    }

    // Exponemos el QueryRunner en el request para que los servicios
    // puedan usarlo cuando necesiten operar dentro de esta misma transaccion
    request.queryRunner = qR;

    return qR;
  }
}
