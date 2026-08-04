import { forwardRef, Module } from '@nestjs/common';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from './empresa.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entity/empresa.entity';
import { AuthModule } from '@src/auth/auth.module';
import { ErroresModule } from '@src/error/error.module';
import { GateWayModule } from '@src/gateway/gateway.module';
import { PrecioEmpresaService } from '@src/precio/precio_empresa.service';
import { PrecioModule } from '@src/precio/precio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Empresa
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => PrecioModule),
  ],
  controllers: [EmpresaController],
  providers: [EmpresaService]
})
export class EmpresaModule { }
