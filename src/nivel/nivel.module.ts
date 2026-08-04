import { forwardRef, Module } from '@nestjs/common';
import { NivelController } from './nivel.controller';
import { NivelService } from './nivel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nivel } from './entity/nivel.entity';
import { AuthModule } from '@src/auth/auth.module';
import { ErroresModule } from '@src/error/error.module';
import { GateWayModule } from '@src/gateway/gateway.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        Nivel,
      ]),
      forwardRef(() => AuthModule),
      forwardRef(() => ErroresModule),
      forwardRef(() => GateWayModule),
    ],
  controllers: [NivelController],
  providers: [NivelService],
  exports: [NivelService]
})
export class NivelModule {}
