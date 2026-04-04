import { Test, TestingModule } from '@nestjs/testing';
import { PropuestaPedidoService } from '../propuesta_pedido.service';

describe('PropuestaPedidoService', () => {
  let service: PropuestaPedidoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropuestaPedidoService],
    }).compile();

    service = module.get<PropuestaPedidoService>(PropuestaPedidoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
