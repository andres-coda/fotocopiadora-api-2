import { forwardRef, Module } from '@nestjs/common';
import { ClienteResumenController } from './cliente_resumen.controller';
import { ClienteResumenService } from './cliente_resumen.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@src/user/entity/user.entity';
import { ClienteResumen } from './entity/clienteResumen.entity';
import { Cliente } from '@src/cliente/entity/cliente.entity';
import { AuthModule } from '@src/auth/auth.module';
import { UserModule } from '@src/user/user.module';
import { ErroresModule } from '@src/error/error.module';
import { GateWayModule } from '@src/gateway/gateway.module';

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
  ],
  controllers: [ClienteResumenController],
  providers: [ClienteResumenService],
  exports: [ClienteResumenService]
})
export class ClienteResumenModule { }
