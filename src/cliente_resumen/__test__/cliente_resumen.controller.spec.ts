import { Test, TestingModule } from '@nestjs/testing';
import { ClienteResumenController } from '../cliente_resumen.controller';

describe('ClienteResumenController', () => {
  let controller: ClienteResumenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClienteResumenController],
    }).compile();

    controller = module.get<ClienteResumenController>(ClienteResumenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
