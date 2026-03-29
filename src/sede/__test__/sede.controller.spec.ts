import { Test, TestingModule } from '@nestjs/testing';
import { SedeController } from '../sede.controller';

describe('SedeController', () => {
  let controller: SedeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SedeController],
    }).compile();

    controller = module.get<SedeController>(SedeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
