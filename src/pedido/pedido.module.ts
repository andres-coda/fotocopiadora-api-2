import { forwardRef, Module } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@src/user/entity/user.entity';
import { AuthModule } from '@src/auth/auth.module';
import { UserModule } from '@src/user/user.module';
import { ErroresModule } from '@src/error/error.module';
import { GateWayModule } from '@src/gateway/gateway.module';
import { Cliente } from '@src/cliente/entity/cliente.entity';
import { ClienteModule } from '@src/cliente/cliente.module';
import { Pedido } from './entity/pedido.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Cliente,
      Pedido
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => ClienteModule),
  ],
  controllers: [PedidoController],
  providers: [PedidoService],
  exports: [PedidoService]
})
export class PedidoModule { }
