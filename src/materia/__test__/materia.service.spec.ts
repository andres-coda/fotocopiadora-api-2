import { Test, TestingModule } from '@nestjs/testing';
import { MateriaService } from '../materia.service';

describe('MateriaService', () => {
  let service: MateriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MateriaService],
    }).compile();

    service = module.get<MateriaService>(MateriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
