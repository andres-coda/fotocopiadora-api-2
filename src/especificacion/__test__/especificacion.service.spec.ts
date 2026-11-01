import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { Especificacion } from '../entity/especificacion.entity';
import { EspecificacionService } from '../especificacion.service';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DtoEspecificacionCrear } from '../dto/DtoCrearEspecificacion.dto';
import { Especificaciones } from '@src/pedido_item/interface/especificaciones.interface';
import { mockEsp } from 'test/mock/esp.mock';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';

describe('EspecificacionService', () => {
  let service: EspecificacionService;
  let repo: jest.Mocked<Repository<Especificacion>>;
  let qr: jest.Mocked<QueryRunner>;
  let manager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Especificacion>();
    qr = qrMock.qr;
    manager = qrMock.manager;
    repo = createMockRepository<Especificacion>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EspecificacionService,
        { provide: getRepositoryToken(Especificacion), useValue: repo },
        { provide: DataSource, useValue: createMockDataSource(qr) },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<EspecificacionService>(EspecificacionService);
    jest.clearAllMocks();
  });

  afterEach(() => { jest.restoreAllMocks(); });

  describe('createEspecificacion', () => {
    it('debería crear una especificación nueva', async () => {
      jest.spyOn(service, 'getEspecificacionByNombre').mockResolvedValue(undefined);
      manager.save.mockResolvedValue(mockEsp);

      const result = await service.createEspecificacion({
        dto: { nombre: mockEsp.nombre },
        qR: qr,
      });

      expect(result).toEqual(mockEsp);
      expect(manager.save).toHaveBeenCalledWith(Especificacion, expect.any(Especificacion));
    });

    it('debería devolver la existente si ya existe', async () => {
      jest.spyOn(service, 'getEspecificacionByNombre').mockResolvedValue(mockEsp);

      const result = await service.createEspecificacion({
        dto: { nombre: mockEsp.nombre },
        qR: qr,
      });

      expect(result).toEqual(mockEsp);
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('debería delegar el error a erroresService', async () => {
      const error = new Error('boom');
      jest.spyOn(service, 'getEspecificacionByNombre').mockRejectedValue(error);

      await expect(
        service.createEspecificacion({ dto: { nombre: mockEsp.nombre }, qR: qr }),
      ).rejects.toThrow(error);

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  describe('updateEspecificacion', () => {
    it('debería actualizar el nombre', async () => {
      jest.spyOn(service, 'getEspecificacionByIdOrFaild').mockResolvedValue({ ...mockEsp } as Especificacion);
      manager.save.mockResolvedValue({ ...mockEsp, nombre: Especificaciones.ABROCHADO } as Especificacion);

      const result = await service.updateEspecificacion({
        id: mockEsp.id,
        dto: { nombre: Especificaciones.ABROCHADO },
        qR: qr,
      });

      expect(result.nombre).toBe(Especificaciones.ABROCHADO);
      expect(manager.save).toHaveBeenCalled();
    });

    it('debería devolver la misma si el nombre no cambia', async () => {
      jest.spyOn(service, 'getEspecificacionByIdOrFaild').mockResolvedValue({ ...mockEsp } as Especificacion);

      const result = await service.updateEspecificacion({
        id: mockEsp.id,
        dto: { nombre: mockEsp.nombre },
        qR: qr,
      });

      expect(result).toEqual({ ...mockEsp });
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('debería delegar el error a erroresService en update', async () => {
      const error = new Error('boom');
      jest.spyOn(service, 'getEspecificacionByIdOrFaild').mockRejectedValue(error);

      await expect(
        service.updateEspecificacion({ id: mockEsp.id, dto: { nombre: Especificaciones.ANILLADO }, qR: qr }),
      ).rejects.toThrow(error);

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  describe('getEspecificacionesByNombres', () => {
    it('debería buscar por nombres con QueryRunner', async () => {
      manager.find.mockResolvedValue([mockEsp]);
      const result = await service.getEspecificacionesByNombres({
        nombres: [mockEsp.nombre],
        qR: qr,
      });
      expect(result).toEqual([mockEsp]);
      expect(manager.find).toHaveBeenCalled();
    });

    it('debería delegar el error a erroresService', async () => {
      const error = new Error('boom');
      manager.find.mockRejectedValue(error);

      await expect(
        service.getEspecificacionesByNombres({ nombres: [mockEsp.nombre], qR: qr }),
      ).rejects.toThrow(error);

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });
});
