import { Test, TestingModule } from '@nestjs/testing';
import { EspecificacionController } from '../especificacion.controller';

describe('EspecificacionController', () => {
  let controller: EspecificacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EspecificacionController],
    }).compile();

    controller = module.get<EspecificacionController>(EspecificacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
