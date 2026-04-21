import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, EntityManager } from 'typeorm';
import { LibroPedido } from '../entity/libroPedido.entity';
import { mockLibro } from 'test/mock/libro.mock';
import { mockPedido } from 'test/mock/pedido.mock';
import { mockSede } from 'test/mock/sede.mock';
import { mockUser } from 'test/mock/user.mock';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { jest, describe, beforeEach, afterEach, it } from '@jest/globals';
import { LibroPedidoService } from '../libro_pedido.service';

jest.mock('@src/libro/entity/libro.entity', () => ({
  Libro: class { },
}));

jest.mock('@src/pedido/entity/pedido.entity', () => ({
  Pedido: class { },
}));

jest.mock('@src/especificacion/entity/especificacion.entity', () => ({
  Especificacion: class { },
}));

jest.mock('@src/stock/entity/stock.entity', () => ({
  Stock: class { },
}));

jest.mock('@src/sede/entity/sede.entity', () => ({
  Sede: class { },
}));

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

describe('LibroPedidoService', () => {
  let service: LibroPedidoService;
  let repo: jest.Mocked<Repository<LibroPedido>>;
  let qr: jest.Mocked<QueryRunner>;
  let manager: jest.Mocked<EntityManager>;

  const libroService = { getDatoByIdOrFail: jest.fn() };
  const pedidoService = { getDatoByIdOrFail: jest.fn() };
  const sedeService = { getDatoByIdOrFail: jest.fn() };
  const espService = { getDatosByNombres: jest.fn() };
  const stockService = { updateDato: jest.fn() };

  beforeEach(async () => {
    manager = {
      save: jest.fn(),
    } as any;

    qr = {
      manager,
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LibroPedidoService,
        {
          provide: getRepositoryToken(LibroPedido),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => qr),
          },
        },
        { provide: 'ErroresService', useValue: mockErrores },
        { provide: 'GatewayGateway', useValue: mockGateway },
        { provide: 'LibroService', useValue: libroService },
        { provide: 'PedidoService', useValue: pedidoService },
        { provide: 'EspecificacionService', useValue: espService },
        { provide: 'StockService', useValue: stockService },
        { provide: 'SedeService', useValue: sedeService },
      ],
    }).compile();

    service = module.get(LibroPedidoService);
    repo = module.get(getRepositoryToken(LibroPedido));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- CREATE ----------------

  describe('createDato', () => {
    it('✅ debería crear correctamente', async () => {
      libroService.getDatoByIdOrFail.mockResolvedValue(mockLibro);
      pedidoService.getDatoByIdOrFail.mockResolvedValue(mockPedido);
      sedeService.getDatoByIdOrFail.mockResolvedValue(mockSede);
      espService.getDatosByNombres.mockResolvedValue([]);

      repo.save.mockResolvedValue(mockLibroPedido);

      const result = await service.createDato({
        usuario: mockUser,
        dto: {
          libro_id: mockLibro.id,
          pedido_id: mockPedido.id,
          sede_id: mockSede.id,
          cantidad: 2,
        },
        entidad: Entidad.LIBRO_PEDIDO,
      } as any);

      expect(repo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toEqual(mockLibroPedido);
    });
  });

  // ---------------- UPDATE ----------------

  describe('updateDato', () => {
    it('✅ debería actualizar correctamente', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockLibroPedido);

      repo.save.mockResolvedValue(mockLibroPedido);

      const result = await service.updateDato({
        id: mockLibroPedido.id,
        usuarioId: mockUser.id,
        dto: { cantidad: 5 },
        entidad: Entidad.LIBRO_PEDIDO,
      } as any);

      expect(repo.save).toHaveBeenCalled();
      expect(result.dato).toEqual(mockLibroPedido);
    });
  });

  // ---------------- CAMBIAR ESTADO ----------------

  describe('cambiarEstadoCx', () => {
    it('✅ debería hacer commit y actualizar estado', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockLibroPedido);

      stockService.updateDato.mockResolvedValue({
        dato: mockLibro.stock,
        isQr: true,
      });

      manager.save.mockResolvedValue({
        ...mockLibroPedido,
        estado: Estado.LISTO,
      });

      const result = await service.cambiarEstadoCx({
        usuario: mockUser,
        dto: { estado: Estado.LISTO },
        id: mockLibroPedido.id,
        entidadError: 'libroPedido',
        entidad: Entidad.LIBRO_PEDIDO,
      } as any);

      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
      expect(result.estado).toBe(Estado.LISTO);
    });

    it('❌ debería hacer rollback si falla', async () => {
      const error = new Error('fail');
      const handled = new Error('handled');

      jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(error);

      jest.spyOn(mockErrores, 'handleExceptions').mockImplementation(() => {
        throw handled;
      });

      await expect(
        service.cambiarEstadoCx({
          usuario: mockUser,
          dto: { estado: Estado.LISTO },
          id: mockLibroPedido.id,
          entidadError: 'libroPedido',
          entidad: Entidad.LIBRO_PEDIDO,
        } as any)
      ).rejects.toThrow(handled);

      expect(qr.rollbackTransaction).toHaveBeenCalled();
    });

    it('🧹 siempre libera QueryRunner', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockLibroPedido);

      stockService.updateDato.mockResolvedValue({
        dato: mockLibro.stock,
        isQr: true,
      });

      manager.save.mockResolvedValue(mockLibroPedido);

      await service.cambiarEstadoCx({
        usuario: mockUser,
        dto: { estado: Estado.LISTO },
        id: mockLibroPedido.id,
        entidadError: 'libroPedido',
        entidad: Entidad.LIBRO_PEDIDO,
      } as any);

      expect(qr.release).toHaveBeenCalled();
    });
  });
});