import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { Sede } from '../entity/sede.entity';
import { SedeService } from '../sede.service';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { DtoSedeCrear } from '../dto/sedeCrear.dto';
import { DtoSedeEditar } from '../dto/sedeEditar.dto';
import { CreateProp, EditarProp } from '@src/base/interface/base.interface';
import { mockSede, mockDtoCrearSede } from 'test/mock/sede.mock';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';

jest.mock('@src/base/entity/base.entity', () => ({ Base: class {} }));

describe('SedeService', () => {
  let service: SedeService;
  let repo: jest.Mocked<Repository<Sede>>;
  let qr: jest.Mocked<QueryRunner>;
  let manager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Sede>();
    qr = qrMock.qr;
    manager = qrMock.manager;
    repo = createMockRepository<Sede>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SedeService,
        { provide: getRepositoryToken(Sede), useValue: repo },
        { provide: DataSource, useValue: createMockDataSource(qr) },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<SedeService>(SedeService);
    jest.clearAllMocks();
  });

  afterEach(() => { jest.restoreAllMocks(); });

  describe('createDato', () => {
    it('debería crear una sede nueva (sin QueryRunner)', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      repo.save.mockResolvedValue(mockSede);

      const result = await service.createDato({
        dto: mockDtoCrearSede,
        entidad: Entidad.SEDE,
      } as CreateProp<DtoSedeCrear, typeof Entidad.SEDE>);

      expect(result).toEqual(mockSede);
      expect(repo.save).toHaveBeenCalled();
    });

    it('debería devolver la sede existente si ya existe (no borrada)', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(mockSede);

      const result = await service.createDato({
        dto: mockDtoCrearSede,
        entidad: Entidad.SEDE,
      } as CreateProp<DtoSedeCrear, typeof Entidad.SEDE>);

      expect(result).toEqual(mockSede);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería revivir la sede si la existente estaba borrada', async () => {
      const borrada = { ...mockSede, deleted: true } as Sede;
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(borrada);
      repo.save.mockResolvedValue({ ...borrada, deleted: false } as Sede);

      const result = await service.createDato({
        dto: mockDtoCrearSede,
        entidad: Entidad.SEDE,
      } as CreateProp<DtoSedeCrear, typeof Entidad.SEDE>);

      expect(result.deleted).toBe(false);
      expect(repo.save).toHaveBeenCalled();
    });

    it('debería usar el QueryRunner si se provee', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      manager.save.mockResolvedValue(mockSede);

      const result = await service.createDato({
        dto: mockDtoCrearSede,
        qR: qr,
        entidad: Entidad.SEDE,
      } as CreateProp<DtoSedeCrear, typeof Entidad.SEDE>);

      expect(result).toEqual(mockSede);
      expect(manager.save).toHaveBeenCalledWith(Sede, expect.any(Sede));
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería delegar el error a erroresService', async () => {
      const error = new Error('boom');
      jest.spyOn(service, 'getDatoByName').mockRejectedValue(error);

      await expect(
        service.createDato({
          dto: mockDtoCrearSede,
          entidad: Entidad.SEDE,
        } as CreateProp<DtoSedeCrear, typeof Entidad.SEDE>),
      ).rejects.toThrow(error);

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  describe('updateDato', () => {
    it('debería actualizar el nombre de una sede', async () => {
      const existente = { ...mockSede, nombre: 'Sede Principal' } as Sede;
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(existente);
      repo.save.mockResolvedValue({ ...existente, nombre: 'Nueva' } as Sede);

      const result = await service.updateDato({
        id: mockSede.id,
        dto: { nombre: 'Nueva' } as DtoSedeEditar,
        qR: undefined as any,
        entidadError: 'sede',
        relaciones: [],
        selected: undefined,
        entidad: Entidad.SEDE,
      });

      expect(result.isQr).toBe(true);
      expect(repo.save).toHaveBeenCalled();
    });

    it('debería devolver isQr false si el nombre no cambia', async () => {
      const existente = { ...mockSede, nombre: 'Sede Principal' } as Sede;
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(existente);

      const result = await service.updateDato({
        id: mockSede.id,
        dto: { nombre: 'Sede Principal' } as DtoSedeEditar,
        qR: undefined as any,
        entidadError: 'sede',
        relaciones: [],
        selected: undefined,
        entidad: Entidad.SEDE,
      });

      expect(result.isQr).toBe(false);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debería delegar el error a erroresService en update', async () => {
      const error = new Error('boom');
      jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(error);

      await expect(
        service.updateDato({
          id: mockSede.id,
          dto: { nombre: 'X' } as DtoSedeEditar,
          qR: undefined as any,
          entidadError: 'sede',
          relaciones: [],
          selected: undefined,
          entidad: Entidad.SEDE,
        }),
      ).rejects.toThrow(error);

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('debería marcar deleted y limpiar la configuración de empresa', async () => {
      const existente = { ...mockSede } as Sede;
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(existente);
      manager.save.mockResolvedValue({ ...existente, deleted: true } as Sede);
      (manager as any).query = jest.fn();

      const result = await service.softDelete({
        id: mockSede.id,
        qR: qr,
        entidadError: 'sede',
        entidad: Entidad.SEDE,
      });

      expect(result).toBe(true);
      expect(manager.query).toHaveBeenCalledWith(
        'update configuraciones set id_sede = null where id_sede = $1',
        [mockSede.id],
      );
    });
  });
});
