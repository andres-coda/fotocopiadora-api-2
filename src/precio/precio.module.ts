import { forwardRef, Module } from '@nestjs/common';
import { PrecioController } from './precio.controller';
import { PrecioService } from './precio.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { Precio } from './entity/precio.entity';
import { PrecioEmpresa } from './entity/precio_empresa.entity';
import { PrecioEmpresaController } from './precio_empresa.controller';
import { PrecioEmpresaService } from './precio_empresa.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Precio,
      PrecioEmpresa
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
  ],
  controllers: [PrecioController, PrecioEmpresaController],
  providers: [PrecioService, PrecioEmpresaService],
  exports: [PrecioService, PrecioEmpresaService]
})
export class PrecioModule { }
