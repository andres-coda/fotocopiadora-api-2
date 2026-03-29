import { Test, TestingModule } from '@nestjs/testing';
import { SedeService } from '../sede.service';

describe('SedeService', () => {
  let service: SedeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SedeService],
    }).compile();

    service = module.get<SedeService>(SedeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
