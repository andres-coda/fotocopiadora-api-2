import { Test, TestingModule } from '@nestjs/testing';
import { EditorialService } from '../editorial.service';

describe('EditorialService', () => {
  let service: EditorialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EditorialService],
    }).compile();

    service = module.get<EditorialService>(EditorialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
