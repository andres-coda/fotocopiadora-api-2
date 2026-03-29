import { forwardRef, Module } from '@nestjs/common';
import { SedeController } from './sede.controller';
import { SedeService } from './sede.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@src/user/entity/user.entity';
import { AuthModule } from '@src/auth/auth.module';
import { UserModule } from '@src/user/user.module';
import { ErroresModule } from '@src/error/error.module';
import { GateWayModule } from '@src/gateway/gateway.module';
import { Sede } from './entity/sede.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Sede
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
  ],
  controllers: [SedeController],
  providers: [SedeService],
  exports: [SedeService]
})
export class SedeModule { }
