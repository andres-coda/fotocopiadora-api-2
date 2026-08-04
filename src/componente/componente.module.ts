import { forwardRef, Module } from '@nestjs/common';
import { ComponenteController } from './componente.controller';
import { ComponenteService } from './componente.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Componente } from './entity/componente.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Componente,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
  ],
  controllers: [ComponenteController],
  providers: [ComponenteService],
  exports: [ComponenteService]
})
export class ComponenteModule { }
