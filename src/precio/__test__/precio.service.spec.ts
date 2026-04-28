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
import { Precio } from '../entity/precio.entity';
import { PrecioService } from '../precio.service';
import { mockDtoCrearPrecio, mockPrecio } from 'test/mock/precio.mock';

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

const mockRepo = createMockRepository<Precio>();
let qr: jest.Mocked<QueryRunner>;
let manager: jest.Mocked<EntityManager>;


describe('PrecioService', () => {
  let service: PrecioService;
  let repo: Repository<Precio>;
  let erroresService: ErroresService;
  let gateway: GatewayGateway;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Precio>();
    qr = qrMock.qr;
    manager = qrMock.manager;
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrecioService,
        {
          provide: getRepositoryToken(Precio),
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


    service = module.get<PrecioService>(PrecioService);
    repo = module.get(getRepositoryToken(Precio));
    erroresService = module.get(ErroresService);
    gateway = module.get(GatewayGateway);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  // ---------------- CREATE ----------------

  describe('createDato', () => {
    it('✔️ debería crear un precio correctamente', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      mockRepo.save.mockResolvedValue(mockPrecio);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearPrecio,
        entidad: Entidad.PRECIO,
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toEqual(mockPrecio);
    });

    it('✔️ debería devolver precio existente', async () => {
      const existente = mockPrecio;

      jest.spyOn(service, 'getDatoByName').mockResolvedValue(existente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearPrecio,
        entidad: Entidad.PRECIO,
      });

      expect(result).toBe(existente);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner si existe', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      manager.save.mockResolvedValue(mockPrecio);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearPrecio,
        entidad: Entidad.PRECIO,
        qR: qr
      });

      expect(result).toEqual(mockPrecio);
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
        dto: mockDtoCrearPrecio,
        entidad: Entidad.PRECIO,
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
    it('✔️ debería actualizar precio', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockPrecio);

      mockRepo.save.mockResolvedValue(mockPrecio);

      const result = await service.updateDato({
        usuarioId: mockUser.id,
        dto: mockDtoCrearPrecio,
        entidad: Entidad.PRECIO,
        id: mockPrecio.id,
      });


      expect(result).toEqual({
        dato: mockPrecio,
        isQr: true
      });


      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner en update', async () => {

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockPrecio);
      manager.save.mockResolvedValue(mockPrecio);

      const result = await service.updateDato({
        id: mockPrecio.id,
        usuarioId: mockUser.id,
        dto: mockDtoCrearPrecio,
        entidad: Entidad.PRECIO,
        qR: qr
      });

      expect(result).toEqual({
        dato: mockPrecio,
        isQr: true
      });

      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores en update', async () => {

      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockPrecio);
      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.updateDato({
          id: mockPrecio.id,
          usuarioId: mockUser.id,
          dto: mockDtoCrearPrecio,
          entidad: Entidad.PRECIO
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });
});