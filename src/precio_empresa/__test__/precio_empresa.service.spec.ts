import { Test, TestingModule } from '@nestjs/testing';
import { PrecioEmpresaService } from '../precio_empresa.service';

describe('PrecioEmpresaService', () => {
  let service: PrecioEmpresaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrecioEmpresaService],
    }).compile();

    service = module.get<PrecioEmpresaService>(PrecioEmpresaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
