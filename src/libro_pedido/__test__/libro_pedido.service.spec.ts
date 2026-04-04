import { Test, TestingModule } from '@nestjs/testing';
import { LibroPedidoService } from '../libro_pedido.service';

describe('LibroPedidoService', () => {
  let service: LibroPedidoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LibroPedidoService],
    }).compile();

    service = module.get<LibroPedidoService>(LibroPedidoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
