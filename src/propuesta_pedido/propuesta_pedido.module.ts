import { forwardRef, Module } from '@nestjs/common';
import { PropuestaPedidoController } from './propuesta_pedido.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Propuesta } from './entity/propuesta_pedido.entity';
import { Libro } from '../libro/entity/libro.entity';
import { AuthModule } from '../auth/auth.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { LibroModule } from '../libro/libro.module';
import { PropuestaService } from './propuesta_pedido.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Propuesta,
      Libro,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => LibroModule),
  ],
  controllers: [PropuestaPedidoController],
  providers: [PropuestaService],
  exports: [PropuestaService]
})
export class PropuestaPedidoModule { }
