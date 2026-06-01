import { forwardRef, Module } from '@nestjs/common';
import { ClienteController } from './cliente.controller';
import { ClienteService } from './cliente.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Cliente } from './entity/cliente.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { Pedido } from '../pedido/entity/pedido.entity';
import { ClienteResumenModule } from '../cliente_resumen/cliente_resumen.module';
import { PedidoModule } from '@src/pedido/pedido.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cliente,
      Pedido,
      User,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => ClienteResumenModule),
    forwardRef(() => PedidoModule),
  ],
  controllers: [ClienteController],
  providers: [ClienteService],
  exports: [ClienteService]
})
export class ClienteModule { }
