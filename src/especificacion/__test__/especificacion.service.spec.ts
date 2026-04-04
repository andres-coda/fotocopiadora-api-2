import { Test, TestingModule } from '@nestjs/testing';
import { EspecificacionService } from '../especificacion.service';

describe('EspecificacionService', () => {
  let service: EspecificacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EspecificacionService],
    }).compile();

    service = module.get<EspecificacionService>(EspecificacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
