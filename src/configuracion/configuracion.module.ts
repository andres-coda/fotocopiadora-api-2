import { forwardRef, Module } from '@nestjs/common';
import { ConfiguracionController } from './configuracion.controller';
import { ConfiguracionService } from './configuracion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuracion } from './entity/configuracion.entity';
import { AuthModule } from '../auth/auth.module';
import { ErroresModule } from '../error/error.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Configuracion
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ErroresModule),
  ],
  controllers: [ConfiguracionController],
  providers: [ConfiguracionService],
  exports: [ConfiguracionService]
})
export class ConfiguracionModule { }
