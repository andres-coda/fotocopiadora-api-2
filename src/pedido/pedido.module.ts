import { forwardRef, Module } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { Cliente } from '../cliente/entity/cliente.entity';
import { ClienteModule } from '../cliente/cliente.module';
import { Pedido } from './entity/pedido.entity';
import { LibroPedido } from '../libro_pedido/entity/libroPedido.entity';
import { LibroPedidoModule } from '@src/libro_pedido/libro_pedido.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Cliente,
      LibroPedido,
      Pedido,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => ClienteModule),
    forwardRef(() => LibroPedidoModule),
  ],
  controllers: [PedidoController],
  providers: [PedidoService],
  exports: [PedidoService]
})
export class PedidoModule { }
