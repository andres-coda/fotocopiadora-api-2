import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { Role } from '../../auth/rol/rol.enum';

/**
 * Datos del actor autenticado que acompanian toda la vida del request HTTP.
 * Se leen desde el JWT en el `DbContextInterceptor` y se consultan desde
 * cualquier capa sin tener que pasarlos por parametro.
 */
export interface RequestContext {
  idUsuario?: string;
  idEmpresa?: string | null;
  role?: Role;
}

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run<T>(contexto: RequestContext, callback: () => T): T {
    return this.storage.run(contexto, callback);
  }

  get(): RequestContext | undefined {
    return this.storage.getStore();
  }

  get idEmpresa(): string | null | undefined {
    return this.storage.getStore()?.idEmpresa;
  }

  get role(): Role | undefined {
    return this.storage.getStore()?.role;
  }
}
