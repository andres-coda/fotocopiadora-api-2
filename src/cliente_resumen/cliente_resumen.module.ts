import { forwardRef, Module } from '@nestjs/common';
import { ClienteResumenController } from './cliente_resumen.controller';
import { ClienteResumenService } from './cliente_resumen.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { ClienteResumen } from './entity/clienteResumen.entity';
import { Cliente } from '../cliente/entity/cliente.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { ClienteModule } from '@src/cliente/cliente.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ClienteResumen,
      Cliente
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => ClienteModule),
  ],
  controllers: [ClienteResumenController],
  providers: [ClienteResumenService],
  exports: [ClienteResumenService]
})
export class ClienteResumenModule { }
