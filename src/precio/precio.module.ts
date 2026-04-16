import { forwardRef, Module } from '@nestjs/common';
import { PrecioController } from './precio.controller';
import { PrecioService } from './precio.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { Precio } from './entity/precio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Precio
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
  ],
  controllers: [PrecioController],
  providers: [PrecioService],
  exports: [PrecioService]
})
export class PrecioModule { }
