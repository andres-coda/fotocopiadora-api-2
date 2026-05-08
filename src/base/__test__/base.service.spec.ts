import { Test, TestingModule } from '@nestjs/testing';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Base } from '@src/base/entity/base.entity';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base.service';
import { createMockQueryRunner } from 'test/mock/qR.mock';
import { SelectedDeep } from '../interface/base.interface';
import { Entidad, EntidadDatoMapType } from '@src/gateway/dto/gatewayDto.dto';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { mockEntity } from 'test/mock/test.mock';
import { createMockRepository } from 'test/mock/repo.mocks';
import { DtoBaseRetorno } from '../dto/baseRetorno.dto';


jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

jest.mock('@src/cliente/entity/cliente.entity', () => ({
  Cliente: class { },
}));

jest.mock('@src/cliente_resumen/entity/clienteResumen.entity', () => ({
  ClienteResumen: class { },
}));
/* =========================
   🧱 ENTIDAD DE TEST
========================= */

export class TestEntity extends Base {
  nombre!: string;
  constructor() {
    super()
  }
}

export class TestEntityDto extends DtoBaseRetorno {
  nombre!: string;
}

/* =========================
   🧱 SERVICE CONCRETO PARA TEST
========================= */

class TestService extends BaseService<
  typeof Entidad.TESTENTITY,
  TestEntity,
  { nombre: string },
  { nombre?: string }
> {

  constructor(
    repo: Repository<TestEntity>,
    dataSource: DataSource,
    errores: ErroresService,
    gateway: GatewayGateway
  ) {
    super(repo, dataSource, errores, gateway);
  }

  public testMergeSelected<T>(
    base: SelectedDeep<T>,
    override: SelectedDeep<T>
  ): SelectedDeep<T> {
    return this.mergeSelected(base, override);
  }

  async createDato(): Promise<TestEntity> {
    throw new Error('Not implemented');
  }

  async updateDato(): Promise<any> {
    throw new Error('Not implemented');
  }

  remplaceToReturn(entidad: TestEntity): EntidadDatoMapType[typeof Entidad.TESTENTITY] {
  return {
    id: entidad.id,
    nombre: entidad.nombre,
    fechaCreacion: entidad.fechaCreacion,
    fechaActualizacion: entidad.fechaActualizacion,
    deleted: entidad.deleted,
  };
}
}

/* =========================
   🧪 TEST SUITE
========================= */

describe('BaseService', () => {
  let service: TestService;
  let repo: jest.Mocked<Repository<TestEntity>>;
  let dataSource: jest.Mocked<DataSource>;

  const { qr, manager } = createMockQueryRunner<TestEntity>();

  beforeEach(async () => {
    repo = createMockRepository<TestEntity>();

    dataSource = {
      createQueryRunner: jest.fn(() => qr),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestService,
        { provide: Repository, useValue: repo },
        { provide: DataSource, useValue: dataSource },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get(TestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =========================
     🔹 getDato
  ========================= */

  describe('getDato', () => {
    it('debería obtener datos desde repository', async () => {
      repo.find.mockResolvedValue([mockEntity]);

      const result = await service.getDato({ usuarioId: 'u1' });

      expect(result).toEqual([mockEntity]);
      expect(repo.find).toHaveBeenCalled();
    });

    it('debería usar QueryRunner si se provee', async () => {
      manager.find.mockResolvedValue([mockEntity]);

      const result = await service.getDato({
        usuarioId: 'u1',
        qR: qr,
      });

      expect(manager.find).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });

    it('debería manejar errores', async () => {
      const error = new Error('fail');
      repo.find.mockRejectedValue(error);

      await expect(
        service.getDato({ usuarioId: 'u1' })
      ).rejects.toThrow();

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 getDatoByIdOrFail
  ========================= */

  describe('getDatoByIdOrFail', () => {
    it('debería devolver el dato si existe', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue(mockEntity);

      const result = await service.getDatoByIdOrFail({
        id: '1',
        usuarioId: 'u1',
      });

      expect(result).toEqual(mockEntity);
    });

    it('debería lanzar error si no existe', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue(null);

      await expect(
        service.getDatoByIdOrFail({ id: '1', usuarioId: 'u1' })
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si está deleted', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue({
        ...mockEntity,
        deleted: true,
      });

      await expect(
        service.getDatoByIdOrFail({ id: '1', usuarioId: 'u1' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  /* =========================
     🔹 softDelete
  ========================= */

  describe('softDelete', () => {
    it('debería hacer soft delete', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockEntity);
      repo.save.mockResolvedValue(mockEntity);

      const result = await service.softDelete({
        id: '1',
        usuarioId: 'u1',
        entidad: 'cliente',
      } as any);

      expect(result).toBe(true);
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 mergeSelected
  ========================= */

  describe('mergeSelected', () => {

    it('debería mergear objetos simples', () => {
      type TestEntity = {
        a: string;
        b: string;
      };

      const base: SelectedDeep<TestEntity> = { a: true };
      const override: SelectedDeep<TestEntity> = { b: true };

      const result = service.testMergeSelected<TestEntity>(
        base,
        override
      );

      expect(result).toEqual({ a: true, b: true });
    });

    it('debería mergear objetos anidados', () => {
      type TestEntity = {
        user: {
          id: number;
          nombre: string;
        };
      };

      const base: SelectedDeep<TestEntity> = {
        user: { id: true }
      };

      const override: SelectedDeep<TestEntity> = {
        user: { nombre: true }
      };

      const result = service.testMergeSelected<TestEntity>(
        base,
        override
      );

      expect(result).toEqual({
        user: { id: true, nombre: true },
      });
    });

  });

  /* =========================
     🔹 createDatoCx (transacción)
  ========================= */

  describe('createDatoCx', () => {
    it('debería hacer commit si todo sale bien', async () => {
      jest.spyOn(service, 'createDato').mockResolvedValue(mockEntity);

      const result = await service.createDatoCx({
        usuario: { id: 'u1' } as any,
        dto: {},
        entidad: 'cliente',
      } as any);

      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });

    it('debería hacer rollback si falla', async () => {
      jest.spyOn(service, 'createDato').mockRejectedValue(new Error());

      await expect(
        service.createDatoCx({
          usuario: { id: 'u1' } as any,
          dto: {},
          entidad: 'cliente',
        } as any)
      ).rejects.toThrow();

      expect(qr.rollbackTransaction).toHaveBeenCalled();
    });
  });
});