import { Test, TestingModule } from '@nestjs/testing';
import { ComponenteService } from '../componente.service';

describe('ComponenteService', () => {
  let service: ComponenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComponenteService],
    }).compile();

    service = module.get<ComponenteService>(ComponenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
