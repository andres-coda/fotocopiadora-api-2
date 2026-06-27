import { forwardRef, Module } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { Cliente } from '../cliente/entity/cliente.entity';
import { ClienteModule } from '../cliente/cliente.module';
import { Pedido } from './entity/pedido.entity';
import { LibroPedidoModule } from '../libro_pedido/libro_pedido.module';
import { PedidoItem } from '@src/libro_pedido/entity/pedido_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cliente,
      PedidoItem,
      Pedido,
    ]),
    forwardRef(() => AuthModule),
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
