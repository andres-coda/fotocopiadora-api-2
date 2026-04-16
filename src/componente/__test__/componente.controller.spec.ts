import { Test, TestingModule } from '@nestjs/testing';
import { ComponenteController } from '../componente.controller';

describe('ComponenteController', () => {
  let controller: ComponenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComponenteController],
    }).compile();

    controller = module.get<ComponenteController>(ComponenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
