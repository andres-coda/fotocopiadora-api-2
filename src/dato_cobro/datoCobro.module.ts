import { forwardRef, Module } from '@nestjs/common';
import { DatoCobroController } from './datoCobro.controller';
import { DatoCobroService } from './datoCobro.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatoCobro } from './entity/datoCobro.entity';
import { AuthModule } from '../auth/auth.module';
import { ErroresModule } from '../error/error.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DatoCobro
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ErroresModule),
  ],
  controllers: [DatoCobroController],
  providers: [DatoCobroService],
  exports: [DatoCobroService]
})
export class DatoCobroModule { }
