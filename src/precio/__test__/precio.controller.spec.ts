import { Test, TestingModule } from '@nestjs/testing';
import { PrecioController } from '../precio.controller';

describe('PrecioController', () => {
  let controller: PrecioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrecioController],
    }).compile();

    controller = module.get<PrecioController>(PrecioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
