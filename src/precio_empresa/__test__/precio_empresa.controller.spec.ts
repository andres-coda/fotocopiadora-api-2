import { Test, TestingModule } from '@nestjs/testing';
import { PrecioEmpresaController } from '../precio_empresa.controller';

describe('PrecioEmpresaController', () => {
  let controller: PrecioEmpresaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrecioEmpresaController],
    }).compile();

    controller = module.get<PrecioEmpresaController>(PrecioEmpresaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
