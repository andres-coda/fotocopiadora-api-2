import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@src/user/entity/user.entity';
import { AuthModule } from '@src/auth/auth.module';
import { UserModule } from '@src/user/user.module';
import { ErroresModule } from '@src/error/error.module';
import { GateWayModule } from '@src/gateway/gateway.module';
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
