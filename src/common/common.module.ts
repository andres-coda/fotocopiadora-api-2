import { Global, Module } from '@nestjs/common';
import { RequestContextService } from './context/request-context.service';

/**
 * Modulo global: expone el contexto del request a cualquier provider
 * sin necesidad de importarlo en cada feature module.
 */
@Global()
@Module({
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class CommonModule {}
