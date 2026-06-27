import { forwardRef, Module } from '@nestjs/common';
import { ClienteController } from './cliente.controller';
import { ClienteService } from './cliente.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Cliente } from './entity/cliente.entity';
import { AuthModule } from '../auth/auth.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { Pedido } from '../pedido/entity/pedido.entity';
import { ClienteResumen } from './entity/clienteResumen.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClienteResumen,
      Cliente,
      Pedido,
      User,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
  ],
  controllers: [ClienteController],
  providers: [ClienteService],
  exports: [ClienteService]
})
export class ClienteModule { }
