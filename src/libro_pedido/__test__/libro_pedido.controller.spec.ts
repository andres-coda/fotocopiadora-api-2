import { Test, TestingModule } from '@nestjs/testing';
import { LibroPedidoController } from '../libro_pedido.controller';

describe('LibroPedidoController', () => {
  let controller: LibroPedidoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibroPedidoController],
    }).compile();

    controller = module.get<LibroPedidoController>(LibroPedidoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
