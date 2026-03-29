import { Test, TestingModule } from '@nestjs/testing';
import { PrecioService } from '../precio.service';

describe('PrecioService', () => {
  let service: PrecioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrecioService],
    }).compile();

    service = module.get<PrecioService>(PrecioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
