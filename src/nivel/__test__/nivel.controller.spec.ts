import { Test, TestingModule } from '@nestjs/testing';
import { NivelController } from '../nivel.controller';

describe('NivelController', () => {
  let controller: NivelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NivelController],
    }).compile();

    controller = module.get<NivelController>(NivelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
