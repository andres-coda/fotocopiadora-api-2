import { Test, TestingModule } from '@nestjs/testing';
import { LibroPedidoController } from '../libro_pedido.controller';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { LibroPedidoService } from '../libro_pedido.service';
import { mockLibroPedido, mockLibroPedidoService } from 'test/mock/libro_pedido.mock';
import { Estado } from '@src/interface/estado.interface';
import { mockUser } from 'test/mock/user.mock';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { CanActivate } from '@nestjs/common';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { AdminGuard } from '@src/auth/guard/admin.guard';

describe('LibroPedidoController', () => {
  let controller: LibroPedidoController;
  let service: jest.Mocked<LibroPedidoService>;

  const mockGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibroPedidoController],
      providers: [
        {
          provide: LibroPedidoService,
          useValue: mockLibroPedidoService,
        },
      ],
    })
      .overrideGuard(UsuarioGuard)
      .useValue(mockGuard)
      .overrideGuard(AdminGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get(LibroPedidoController);
    service = module.get(LibroPedidoService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  // ---------------- cambiarEstado ----------------

  describe('cambiarEstado', () => {

    it('✅ debería llamar al service con el dto correcto y devolver true', async () => {
      service.cambiarEstadoCx.mockResolvedValue(mockLibroPedido);

      const dto = { estado: Estado.LISTO };

      const result = await controller.cambiarEstado(
        mockLibroPedido.id,
        mockUser,
        dto
      );

      expect(service.cambiarEstadoCx).toHaveBeenCalledWith({
        dto,
        usuario: mockUser,
        entidad: Entidad.LIBRO_PEDIDO,
        id: mockLibroPedido.id,
        usuarioId: mockUser.id,
      });

      expect(result).toBe(true);
    });

    it('❌ debería devolver false si el service devuelve null', async () => {
      service.cambiarEstadoCx.mockResolvedValue(null as any);

      const result = await controller.cambiarEstado(
        mockLibroPedido.id,
        mockUser,
        { estado: Estado.LISTO }
      );

      expect(result).toBe(false);
    });

    it('💥 debería propagar error del service', async () => {
      const error = new Error('fail');
      service.cambiarEstadoCx.mockRejectedValue(error);

      await expect(
        controller.cambiarEstado(
          mockLibroPedido.id,
          mockUser,
          { estado: Estado.LISTO }
        )
      ).rejects.toThrow(error);
    });

    it('🧪 debería enviar correctamente distintos estados', async () => {
      service.cambiarEstadoCx.mockResolvedValue({
        ...mockLibroPedido,
        estado: Estado.CANCELADO,
      });

      const dto = { estado: Estado.CANCELADO };

      await controller.cambiarEstado(
        mockLibroPedido.id,
        mockUser,
        dto
      );

      expect(service.cambiarEstadoCx).toHaveBeenCalledWith(
        expect.objectContaining({
          dto: { estado: Estado.CANCELADO }
        })
      );
    });

  });
});