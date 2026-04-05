import { Test, TestingModule } from '@nestjs/testing';
import { ClienteResumenService } from '../cliente_resumen.service';

describe('ClienteResumenService', () => {
  let service: ClienteResumenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClienteResumenService],
    }).compile();

    service = module.get<ClienteResumenService>(ClienteResumenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
