import { Test, TestingModule } from '@nestjs/testing';
import { LibroService } from '../libro.service';

describe('LibroService', () => {
  let service: LibroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LibroService],
    }).compile();

    service = module.get<LibroService>(LibroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
