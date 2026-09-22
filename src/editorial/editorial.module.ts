import { forwardRef, Module } from '@nestjs/common';
import { EditorialController } from './editorial.controller';
import { EditorialService } from './editorial.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Editorial } from './entity/editorial.entity';
import { AuthModule } from '@src/auth/auth.module';
import { ErroresModule } from '@src/error/error.module';
import { GateWayModule } from '@src/gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Editorial,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
  ],
  controllers: [EditorialController],
  providers: [EditorialService],
  exports: [EditorialService]
})
export class EditorialModule { }
