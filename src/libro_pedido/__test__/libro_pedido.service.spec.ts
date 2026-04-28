import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, EntityManager } from 'typeorm';
import { LibroPedido } from '../entity/libroPedido.entity';
import { mockLibro, mockLibroService } from 'test/mock/libro.mock';
import { mockPedido, mockPedidoService } from 'test/mock/pedido.mock';
import { mockSede, mockSedeService } from 'test/mock/sede.mock';
import { mockUser } from 'test/mock/user.mock';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { LibroPedidoService } from '../libro_pedido.service';
import { createMockRepository } from 'test/mock/repo.mocks';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';
import { LibroService } from '@src/libro/libro.service';
import { PedidoService } from '@src/pedido/pedido.service';
import { EspecificacionService } from '@src/especificacion/especificacion.service';
import { StockService } from '@src/stock/stock.service';
import { SedeService } from '@src/sede/sede.service';
import { mockEspService } from 'test/mock/esp.mock';
import { mockStockService } from 'test/mock/stock.mock';
import { mockDtoLibroPedidoCrear, mockLibroPedido } from 'test/mock/libro_pedido.mock';
import { DtoLibroPedidoEditar } from '../dto/DtoEditarLibroPedido.dto';
import { Estado } from '@src/interface/estado.interface';

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

const mockRepo = createMockRepository<LibroPedido>();
let qr: jest.Mocked<QueryRunner>;
let manager: jest.Mocked<EntityManager>;

describe('LibroPedidoService', () => {
  let service: LibroPedidoService;
  let repo: Repository<LibroPedido>;
  let erroresService: ErroresService;
  let gateway: GatewayGateway;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<LibroPedido>();
    qr = qrMock.qr;
    manager = qrMock.manager;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LibroPedidoService,
        {
          provide: getRepositoryToken(LibroPedido),
          useValue: mockRepo,
        },
        {
          provide: DataSource,
          useValue: createMockDataSource(qr),
        },
        {
          provide: ErroresService,
          useValue: mockErrores,
        },
        {
          provide: GatewayGateway,
          useValue: mockGateway,
        },
        { provide: LibroService, useValue: mockLibroService },
        { provide: PedidoService, useValue: mockPedidoService },
        { provide: EspecificacionService, useValue: mockEspService },
        { provide: StockService, useValue: mockStockService },
        { provide: SedeService, useValue: mockSedeService },
      ],
    }).compile();

    service = module.get<LibroPedidoService>(LibroPedidoService);
    repo = module.get(getRepositoryToken(LibroPedido));
    erroresService = module.get(ErroresService);
    gateway = module.get(GatewayGateway);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  // ---------------- CREATE ----------------

  describe('createDato', () => {
    it('✅ debería crear un pedido libro correctamente', async () => {
      mockLibroService.getDatoByIdOrFail.mockResolvedValue(mockLibro);
      mockPedidoService.getDatoByIdOrFail.mockResolvedValue(mockPedido);
      mockSedeService.getDatoByIdOrFail.mockResolvedValue(mockSede);
      mockEspService.getDatosByNombres.mockResolvedValue([]);

      mockRepo.save.mockResolvedValue(mockLibroPedido);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoLibroPedidoCrear,
        entidad: Entidad.LIBRO_PEDIDO,
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toEqual(mockLibroPedido);
    });

    it('🔁 debería usar QueryRunner si existe', async () => {
      mockLibroService.getDatoByIdOrFail.mockResolvedValue(mockLibro);
      mockPedidoService.getDatoByIdOrFail.mockResolvedValue(mockPedido);
      mockSedeService.getDatoByIdOrFail.mockResolvedValue(mockSede);
      mockEspService.getDatosByNombres.mockResolvedValue([]);

      manager.save.mockResolvedValue(mockLibroPedido);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoLibroPedidoCrear,
        entidad: Entidad.LIBRO_PEDIDO,
        qR: qr
      });

      expect(result).toEqual(mockLibroPedido);
      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores con erroresService', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.createDato({
          usuario: mockUser,
          dto: mockDtoLibroPedidoCrear,
          entidad: Entidad.LIBRO_PEDIDO,
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.any(String)
      );
    });
  });

  // ---------------- UPDATE ----------------
  describe('updateDato', () => {
    it('✅ debería actualizar el pedido libro correctamente', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockLibroPedido);

      mockRepo.save.mockResolvedValue(mockLibroPedido);

      const result = await service.updateDato({
        id: mockLibroPedido.id,
        usuarioId: mockUser.id,
        dto: { cantidad: 5 },
        entidad: Entidad.LIBRO_PEDIDO,
      });

      expect(result).toEqual({
        dato: mockLibroPedido,
        isQr: true
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner en update', async () => {

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockLibroPedido);
      manager.save.mockResolvedValue(mockLibroPedido);

      const result = await service.updateDato({
        id: mockLibroPedido.id,
        usuarioId: mockUser.id,
        dto: { cantidad: 5 },
        entidad: Entidad.LIBRO_PEDIDO,
        qR: qr
      });

      expect(result).toEqual({
        dato: mockLibroPedido,
        isQr: true
      });

      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores en update', async () => {

      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockLibroPedido);
      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.updateDato({
          id: mockLibroPedido.id,
          usuarioId: mockUser.id,
          dto: { cantidad: 5 },
          entidad: Entidad.LIBRO_PEDIDO
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });

  // ---------------- CAMBIAR ESTADO ----------------

  describe('cambiarEstadoCx', () => {
    it('✅ debería hacer commit y actualizar estado', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockLibroPedido);

      mockStockService.updateDato.mockResolvedValue({
        dato: mockLibro.stock,
        isQr: true,
      });

      manager.save.mockResolvedValue({
        ...mockLibroPedido,
        estado: Estado.LISTO,
      });

      const result = await service.cambiarEstadoCx({
        id: mockLibroPedido.id,
        usuarioId: mockUser.id,
        usuario: mockUser,
        dto: { estado: Estado.LISTO },
        entidad: Entidad.LIBRO_PEDIDO,
      });

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
          id: mockLibroPedido.id,
          usuarioId: mockUser.id,
          usuario: mockUser,
          dto: { estado: Estado.LISTO },
          entidad: Entidad.LIBRO_PEDIDO,
        })
      ).rejects.toThrow(handled);

      expect(qr.rollbackTransaction).toHaveBeenCalled();
    });

    it('🧹 siempre libera QueryRunner', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockLibroPedido);

      mockStockService.updateDato.mockResolvedValue({
        dato: mockLibro.stock,
        isQr: true,
      });

      manager.save.mockResolvedValue(mockLibroPedido);

      await service.cambiarEstadoCx({
        id: mockLibroPedido.id,
        usuarioId: mockUser.id,
        usuario: mockUser,
        dto: { estado: Estado.LISTO },
        entidad: Entidad.LIBRO_PEDIDO,
      });

      expect(qr.release).toHaveBeenCalled();
    });
  });
});