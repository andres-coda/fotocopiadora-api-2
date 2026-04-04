import { Test, TestingModule } from '@nestjs/testing';
import { PropuestaPedidoController } from '../propuesta_pedido.controller';

describe('PropuestaPedidoController', () => {
  let controller: PropuestaPedidoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropuestaPedidoController],
    }).compile();

    controller = module.get<PropuestaPedidoController>(PropuestaPedidoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
