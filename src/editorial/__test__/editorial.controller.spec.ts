import { Test, TestingModule } from '@nestjs/testing';
import { EditorialController } from '../editorial.controller';

describe('EditorialController', () => {
  let controller: EditorialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditorialController],
    }).compile();

    controller = module.get<EditorialController>(EditorialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
