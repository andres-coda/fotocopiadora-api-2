import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { Materia } from '../entity/materia.entity';
import { MateriaService } from '../materia.service';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { DtoMateriaCrear } from '../dto/materiaCrear.dto';
import { DtoMateriaEditar } from '../dto/materiaEditar.dto';
import { CreateProp } from '@src/base/interface/base.interface';
import { mockMateria, mockDtoCrearMateria } from 'test/mock/materia.mock';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class {},
}));

describe('MateriaService', () => {
  let service: MateriaService;
  let repo: jest.Mocked<Repository<Materia>>;
  let qr: jest.Mocked<QueryRunner>;
  let manager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Materia>();
    qr = qrMock.qr;
    manager = qrMock.manager;

    repo = createMockRepository<Materia>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MateriaService,
        { provide: getRepositoryToken(Materia), useValue: repo },
        { provide: DataSource, useValue: createMockDataSource(qr) },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<MateriaService>(MateriaService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---------------- CREATE ----------------

  describe('createDato', () => {
    it('debería crear un materia nuevo (sin QueryRunner)', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      repo.save.mockResolvedValue(mockMateria);

      const result = await service.createDato({
        dto: mockDtoCrearMateria,
        entidad: Entidad.MATERIA,
      } as CreateProp<DtoMateriaCrear, typeof Entidad.MATERIA>);

      expect(result).toEqual(mockMateria);
      expect(repo.save).toHaveBeenCalled();
    });

    it('debería devolver el materia existente si ya existe', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(mockMateria);

      const result = await service.createDato({
        dto: mockDtoCrearMateria,
        entidad: Entidad.MATERIA,
      } as CreateProp<DtoMateriaCrear, typeof Entidad.MATERIA>);

      expect(result).toEqual(mockMateria);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería usar el QueryRunner si se provee', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      manager.save.mockResolvedValue(mockMateria);

      const result = await service.createDato({
        dto: mockDtoCrearMateria,
        qR: qr,
        entidad: Entidad.MATERIA,
      } as CreateProp<DtoMateriaCrear, typeof Entidad.MATERIA>);

      expect(result).toEqual(mockMateria);
      expect(manager.save).toHaveBeenCalledWith(Materia, expect.any(Materia));
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería delegar el error a erroresService', async () => {
      const error = new Error('boom');
      jest.spyOn(service, 'getDatoByName').mockRejectedValue(error);

      await expect(
        service.createDato({
          dto: mockDtoCrearMateria,
          entidad: Entidad.MATERIA,
        } as CreateProp<DtoMateriaCrear, typeof Entidad.MATERIA>),
      ).rejects.toThrow(error);

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  // ---------------- UPDATE ----------------

  describe('updateDato', () => {
    it('debería actualizar el nombre de un materia', async () => {
      const existente = { ...mockMateria, nombre: 'Test Materia' } as Materia;
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(existente);
      repo.save.mockResolvedValue({ ...existente, nombre: 'Nuevo Nombre' } as Materia);

      const result = await service.updateDato({
        id: mockMateria.id,
        dto: { nombre: 'Nuevo Nombre' } as DtoMateriaEditar,
        qR: undefined as any,
        entidadError: 'materia',
        relaciones: [],
        selected: undefined,
        entidad: Entidad.MATERIA,
      });

      expect(result.isQr).toBe(true);
      expect(repo.save).toHaveBeenCalled();
    });

    it('debería usar el QueryRunner en update si se provee', async () => {
      const existente = { ...mockMateria, nombre: 'Test Materia' } as Materia;
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(existente);
      manager.save.mockResolvedValue({ ...existente, nombre: 'Nuevo Nombre' } as Materia);

      const result = await service.updateDato({
        id: mockMateria.id,
        dto: { nombre: 'Nuevo Nombre' } as DtoMateriaEditar,
        qR: qr,
        entidadError: 'materia',
        relaciones: [],
        selected: undefined,
        entidad: Entidad.MATERIA,
      });

      expect(result.isQr).toBe(true);
      expect(manager.save).toHaveBeenCalledWith(Materia, expect.objectContaining({ nombre: 'Nuevo Nombre' }));
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería devolver isQr false si el nombre no cambia', async () => {
      const existente = { ...mockMateria, nombre: 'Test Materia' } as Materia;
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(existente);

      const result = await service.updateDato({
        id: mockMateria.id,
        dto: { nombre: 'Test Materia' } as DtoMateriaEditar,
        qR: undefined as any,
        entidadError: 'materia',
        relaciones: [],
        selected: undefined,
        entidad: Entidad.MATERIA,
      });

      expect(result.isQr).toBe(false);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería delegar el error a erroresService en update', async () => {
      const error = new Error('boom');
      jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(error);

      await expect(
        service.updateDato({
          id: mockMateria.id,
          dto: { nombre: 'X' } as DtoMateriaEditar,
          qR: undefined as any,
          entidadError: 'materia',
          relaciones: [],
          selected: undefined,
          entidad: Entidad.MATERIA,
        }),
      ).rejects.toThrow(error);

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });
});
