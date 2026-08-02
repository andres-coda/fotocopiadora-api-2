import { Module } from '@nestjs/common';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from './empresa.service';

@Module({
  controllers: [EmpresaController],
  providers: [EmpresaService]
})
export class EmpresaModule {}
