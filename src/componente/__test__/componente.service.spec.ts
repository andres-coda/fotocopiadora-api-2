import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { Componente } from '../entity/componente.entity';
import { ComponenteService } from '../componente.service';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { DtoComponenteCrear } from '../dto/componenteCrear.dto';
import { DtoComponenteEditar } from '../dto/componenteEditar.dto';
import { CreateProp } from '@src/base/interface/base.interface';
import { mockComponente, mockDtoCrearComponente } from 'test/mock/componente.mock';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class {},
}));

describe('ComponenteService', () => {
  let service: ComponenteService;
  let repo: jest.Mocked<Repository<Componente>>;
  let qr: jest.Mocked<QueryRunner>;
  let manager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Componente>();
    qr = qrMock.qr;
    manager = qrMock.manager;

    repo = createMockRepository<Componente>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComponenteService,
        { provide: getRepositoryToken(Componente), useValue: repo },
        { provide: DataSource, useValue: createMockDataSource(qr) },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<ComponenteService>(ComponenteService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---------------- CREATE ----------------

  describe('createDato', () => {
    it('debería crear un componente nuevo (sin QueryRunner)', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      repo.save.mockResolvedValue(mockComponente);

      const result = await service.createDato({
        dto: mockDtoCrearComponente,
        entidad: Entidad.COMPONENTE,
      } as CreateProp<DtoComponenteCrear, typeof Entidad.COMPONENTE>);

      expect(result).toEqual(mockComponente);
      expect(repo.save).toHaveBeenCalled();
    });

    it('debería devolver el componente existente si ya existe', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(mockComponente);

      const result = await service.createDato({
        dto: mockDtoCrearComponente,
        entidad: Entidad.COMPONENTE,
      } as CreateProp<DtoComponenteCrear, typeof Entidad.COMPONENTE>);

      expect(result).toEqual(mockComponente);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería usar el QueryRunner si se provee', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      manager.save.mockResolvedValue(mockComponente);

      const result = await service.createDato({
        dto: mockDtoCrearComponente,
        qR: qr,
        entidad: Entidad.COMPONENTE,
      } as CreateProp<DtoComponenteCrear, typeof Entidad.COMPONENTE>);

      expect(result).toEqual(mockComponente);
      expect(manager.save).toHaveBeenCalledWith(Componente, expect.any(Componente));
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería delegar el error a erroresService', async () => {
      const error = new Error('boom');
      jest.spyOn(service, 'getDatoByName').mockRejectedValue(error);

      await expect(
        service.createDato({
          dto: mockDtoCrearComponente,
          entidad: Entidad.COMPONENTE,
        } as CreateProp<DtoComponenteCrear, typeof Entidad.COMPONENTE>),
      ).rejects.toThrow(error);

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  // ---------------- UPDATE ----------------

  describe('updateDato', () => {
    it('debería actualizar el nombre de un componente', async () => {
      const existente = { ...mockComponente, nombre: 'Test Componente' } as Componente;
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(existente);
      repo.save.mockResolvedValue({ ...existente, nombre: 'Nuevo Nombre' } as Componente);

      const result = await service.updateDato({
        id: mockComponente.id,
        dto: { nombre: 'Nuevo Nombre' } as DtoComponenteEditar,
        qR: undefined as any,
        entidadError: 'componente',
        relaciones: [],
        selected: undefined,
        entidad: Entidad.COMPONENTE,
      });

      expect(result.isQr).toBe(true);
      expect(repo.save).toHaveBeenCalled();
    });

    it('debería usar el QueryRunner en update si se provee', async () => {
      const existente = { ...mockComponente, nombre: 'Test Componente' } as Componente;
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(existente);
      manager.save.mockResolvedValue({ ...existente, nombre: 'Nuevo Nombre' } as Componente);

      const result = await service.updateDato({
        id: mockComponente.id,
        dto: { nombre: 'Nuevo Nombre' } as DtoComponenteEditar,
        qR: qr,
        entidadError: 'componente',
        relaciones: [],
        selected: undefined,
        entidad: Entidad.COMPONENTE,
      });

      expect(result.isQr).toBe(true);
      expect(manager.save).toHaveBeenCalledWith(Componente, expect.objectContaining({ nombre: 'Nuevo Nombre' }));
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería devolver isQr false si el nombre no cambia', async () => {
      const existente = { ...mockComponente, nombre: 'Test Componente' } as Componente;
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(existente);

      const result = await service.updateDato({
        id: mockComponente.id,
        dto: { nombre: 'Test Componente' } as DtoComponenteEditar,
        qR: undefined as any,
        entidadError: 'componente',
        relaciones: [],
        selected: undefined,
        entidad: Entidad.COMPONENTE,
      });

      expect(result.isQr).toBe(false);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería delegar el error a erroresService en update', async () => {
      const error = new Error('boom');
      jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(error);

      await expect(
        service.updateDato({
          id: mockComponente.id,
          dto: { nombre: 'X' } as DtoComponenteEditar,
          qR: undefined as any,
          entidadError: 'componente',
          relaciones: [],
          selected: undefined,
          entidad: Entidad.COMPONENTE,
        }),
      ).rejects.toThrow(error);

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });
});
