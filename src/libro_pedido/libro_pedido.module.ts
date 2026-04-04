import { forwardRef, Module } from '@nestjs/common';
import { LibroPedidoController } from './libro_pedido.controller';
import { LibroPedidoService } from './libro_pedido.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@src/user/entity/user.entity';
import { LibroPedido } from './entity/libroPedido.entity';
import { AuthModule } from '@src/auth/auth.module';
import { UserModule } from '@src/user/user.module';
import { ErroresModule } from '@src/error/error.module';
import { GateWayModule } from '@src/gateway/gateway.module';
import { Pedido } from '@src/pedido/entity/pedido.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      LibroPedido,
      Pedido,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
  ],
  controllers: [LibroPedidoController],
  providers: [LibroPedidoService],
  exports: [LibroPedidoService]
})
export class LibroPedidoModule { }
