import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { EspecificacionController } from './especificacion.controller';
import { EspecificacionService } from './especificacion.service';
import { Especificacion } from './entity/especificacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Especificacion
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
  ],
  controllers: [EspecificacionController],
  providers: [EspecificacionService],
  exports: [EspecificacionService]
})
export class EspecificacionModule { }
