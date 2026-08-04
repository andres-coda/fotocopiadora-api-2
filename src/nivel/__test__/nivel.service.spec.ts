import { Test, TestingModule } from '@nestjs/testing';
import { NivelService } from '../nivel.service';

describe('NivelService', () => {
  let service: NivelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NivelService],
    }).compile();

    service = module.get<NivelService>(NivelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
