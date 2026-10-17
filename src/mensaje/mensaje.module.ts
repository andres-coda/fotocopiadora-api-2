import { forwardRef, Module } from '@nestjs/common';
import { MensajeController } from './mensaje.controller';
import { MensajeService } from './mensaje.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mensaje } from './entity/mensaje.entity';
import { AuthModule } from '../auth/auth.module';
import { ErroresModule } from '../error/error.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Mensaje
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ErroresModule),
  ],
  controllers: [MensajeController],
  providers: [MensajeService],
  exports: [MensajeService]
})
export class MensajeModule { }
