import { Module } from '@nestjs/common';
import { PrecioEmpresaController } from './precio_empresa.controller';
import { PrecioEmpresaService } from './precio_empresa.service';

@Module({
  controllers: [PrecioEmpresaController],
  providers: [PrecioEmpresaService]
})
export class PrecioEmpresaModule {}
