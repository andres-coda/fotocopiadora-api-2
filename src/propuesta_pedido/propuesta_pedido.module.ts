import { forwardRef, Module } from '@nestjs/common';
import { PropuestaPedidoController } from './propuesta_pedido.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@src/user/entity/user.entity';
import { Propuesta } from './entity/propuesta_pedido.entity';
import { Libro } from '@src/libro/entity/libro.entity';
import { AuthModule } from '@src/auth/auth.module';
import { UserModule } from '@src/user/user.module';
import { ErroresModule } from '@src/error/error.module';
import { GateWayModule } from '@src/gateway/gateway.module';
import { LibroModule } from '@src/libro/libro.module';
import { PropuestaService } from './propuesta_pedido.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Propuesta,
      Libro,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => LibroModule),
  ],
  controllers: [PropuestaPedidoController],
  providers: [PropuestaService]
})
export class PropuestaPedidoModule { }
