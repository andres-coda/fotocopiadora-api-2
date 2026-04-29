import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { mockUser } from 'test/mock/user.mock';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Stock } from '../entity/stock.entity';
import { StockService } from '../stock.service';
import { mockDtoStockCrear, mockDtoStockEditar, mockStock } from 'test/mock/stock.mock';

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

const mockRepo = createMockRepository<Stock>();
let qr: jest.Mocked<QueryRunner>;
let manager: jest.Mocked<EntityManager>;


describe('StockService', () => {
  let service: StockService;
  let repo: Repository<Stock>;
  let erroresService: ErroresService;
  let gateway: GatewayGateway;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Stock>();
    qr = qrMock.qr;
    manager = qrMock.manager;
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: getRepositoryToken(Stock),
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
        }
      ],
    }).compile();


    service = module.get<StockService>(StockService);
    repo = module.get(getRepositoryToken(Stock));
    erroresService = module.get(ErroresService);
    gateway = module.get(GatewayGateway);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  // ---------------- CREATE ----------------

  describe('createDato', () => {
    it('✔️ debería crear un stock correctamente', async () => {
      mockRepo.save.mockResolvedValue(mockStock);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoStockCrear,
        entidad: Entidad.STOCK,
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toEqual(mockStock);
    });

    

    it('🔁 debería usar QueryRunner si existe', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      manager.save.mockResolvedValue(mockStock);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoStockCrear,
        entidad: Entidad.STOCK,
        qR: qr
      });

      expect(result).toEqual(mockStock);
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
        dto: mockDtoStockCrear,
        entidad: Entidad.STOCK,
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
    it('✔️ debería actualizar un stock', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockStock);

      mockRepo.save.mockResolvedValue(mockStock);

      const result = await service.updateDato({
        usuarioId: mockUser.id,
        dto: mockDtoStockEditar,
        entidad: Entidad.STOCK,
        id: mockStock.id,
      });


      expect(result).toEqual({
        dato: mockStock,
        isQr: true
      });


      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner en update', async () => {

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockStock);
      manager.save.mockResolvedValue(mockStock);

      const result = await service.updateDato({
        id: mockStock.id,
        usuarioId: mockUser.id,
        dto: mockDtoStockEditar,
        entidad: Entidad.STOCK,
        qR: qr
      });

      expect(result).toEqual({
        dato: mockStock,
        isQr: true
      });

      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores en update', async () => {

      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockStock);
      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.updateDato({
          id: mockStock.id,
          usuarioId: mockUser.id,
          dto: mockDtoStockEditar,
          entidad: Entidad.STOCK
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });
});