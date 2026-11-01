import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { Precio } from '../entity/precio.entity';
import { PrecioService } from '../precio.service';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DtoPrecioCrear, DtoPrecioEditar } from '../dto/precio.dto';
import { CreateGenericoProp, UpdateGenericoProp } from '@src/interface/general.interface';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';

describe('PrecioService', () => {
  let service: PrecioService;
  let repo: jest.Mocked<Repository<Precio>>;
  let qr: jest.Mocked<QueryRunner>;
  let manager: jest.Mocked<EntityManager>;

  const precioMock: Precio = { id: '1', nombre: 'Test Precio' } as Precio;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Precio>();
    qr = qrMock.qr;
    manager = qrMock.manager;
    repo = createMockRepository<Precio>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrecioService,
        { provide: getRepositoryToken(Precio), useValue: repo },
        { provide: DataSource, useValue: createMockDataSource(qr) },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<PrecioService>(PrecioService);
    jest.clearAllMocks();
  });

  afterEach(() => { jest.restoreAllMocks(); });

  describe('createDato', () => {
    it('debería crear un precio nuevo (sin QueryRunner)', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      repo.save.mockResolvedValue(precioMock);

      const result = await service.createDato({
        dto: { nombre: 'Test Precio' },
        qR: undefined as any,
        entidad: undefined,
      } as CreateGenericoProp<DtoPrecioCrear>);

      expect(result).toEqual(precioMock);
      expect(repo.save).toHaveBeenCalled();
    });

    it('debería devolver el precio existente', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(precioMock);

      const result = await service.createDato({
        dto: { nombre: 'Test Precio' },
      } as CreateGenericoProp<DtoPrecioCrear>);

      expect(result).toEqual(precioMock);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería usar el QueryRunner si se provee', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      manager.save.mockResolvedValue(precioMock);

      const result = await service.createDato({
        dto: { nombre: 'Test Precio' },
        qR: qr,
      } as CreateGenericoProp<DtoPrecioCrear>);

      expect(result).toEqual(precioMock);
      expect(manager.save).toHaveBeenCalledWith(Precio, expect.any(Precio));
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería delegar el error a erroresService', async () => {
      const error = new Error('boom');
      jest.spyOn(service, 'getDatoByName').mockRejectedValue(error);

      await expect(
        service.createDato({ dto: { nombre: 'Test Precio' } } as CreateGenericoProp<DtoPrecioCrear>),
      ).rejects.toThrow(error);

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  describe('updateDato', () => {
    it('debería actualizar el nombre de un precio', async () => {
      const existente = { ...precioMock, descripcion: '' } as Precio;
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(existente);
      manager.save.mockResolvedValue({ ...existente, nombre: 'Nuevo' } as Precio);

      const result = await service.updateDato({
        dto: { nombre: 'Nuevo' },
        qR: qr,
        id: precioMock.id,
      } as UpdateGenericoProp<DtoPrecioEditar>);

      expect(result.nombre).toBe('Nuevo');
      expect(manager.save).toHaveBeenCalled();
    });

    it('debería lanzar si el precio ya tiene descripcion (usado)', async () => {
      const existente = { ...precioMock, descripcion: 'usado' } as Precio;
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(existente);

      await expect(
        service.updateDato({
          dto: { nombre: 'Nuevo' },
          qR: qr,
          id: precioMock.id,
        } as UpdateGenericoProp<DtoPrecioEditar>),
      ).rejects.toThrow();
    });

    it('debería devolver el mismo precio si el nombre no cambia', async () => {
      const existente = { ...precioMock, descripcion: '' } as Precio;
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(existente);

      const result = await service.updateDato({
        dto: { nombre: 'Test Precio' },
        qR: qr,
        id: precioMock.id,
      } as UpdateGenericoProp<DtoPrecioEditar>);

      expect(result).toEqual(existente);
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('debería delegar el error a erroresService en update', async () => {
      const error = new Error('boom');
      jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(error);

      await expect(
        service.updateDato({
          dto: { nombre: 'X' },
          qR: qr,
          id: precioMock.id,
        } as UpdateGenericoProp<DtoPrecioEditar>),
      ).rejects.toThrow(error);

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });
});
