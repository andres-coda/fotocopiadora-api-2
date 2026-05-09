import { Test, TestingModule } from '@nestjs/testing';
import { Repository, DataSource } from 'typeorm';
import { Base } from '@src/base/entity/base.entity';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { BaseService } from '../base.service';
import { createMockQueryRunner } from 'test/mock/qR.mock';
import { SelectedDeep } from '../interface/base.interface';
import { Entidad, EntidadDatoMapType } from '@src/gateway/dto/gatewayDto.dto';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { mockEntity } from 'test/mock/test.mock';
import { createMockRepository } from 'test/mock/repo.mocks';
import { DtoBaseRetorno } from '../dto/baseRetorno.dto';

/* =========================
   🔧 MOCKS DE MÓDULOS
========================= */

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
    super();
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
    base: SelectedDeep<T> | undefined,
    override: SelectedDeep<T>
  ): SelectedDeep<T> {
    return this.mergeSelected(base, override);
  }

  public testMergeRelations(
    input?: any,
    relacionBase?: any
  ) {
    return this.mergeRelations(input, relacionBase);
  }

  public testCrearCriterio(params: any) {
    return this.crearCriterio(params);
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
    it('[camino feliz] debería obtener datos activos desde repository', async () => {
      repo.find.mockResolvedValue([mockEntity]);

      const result = await service.getDato({ usuarioId: 'u1' });

      expect(result).toEqual([mockEntity]);
      expect(repo.find).toHaveBeenCalledTimes(1);
    });

    it('[camino feliz] debería retornar array vacío si no hay datos', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.getDato({ usuarioId: 'u1' });

      expect(result).toEqual([]);
      expect(repo.find).toHaveBeenCalled();
    });

    it('[transacción] debería usar qR.manager.find si se provee QueryRunner', async () => {
      manager.find.mockResolvedValue([mockEntity]);

      const result = await service.getDato({ usuarioId: 'u1', qR: qr });

      expect(manager.find).toHaveBeenCalled();
      expect(repo.find).not.toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });

    it('[error] debería llamar handleExceptions si el repositorio falla', async () => {
      const error = new Error('DB error');
      repo.find.mockRejectedValue(error);

      await expect(service.getDato({ usuarioId: 'u1' })).rejects.toThrow();
      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 getDatoTodos
  ========================= */

  describe('getDatoTodos', () => {
    it('[camino feliz] debería obtener todos los datos incluyendo eliminados', async () => {
      const entityDeleted = { ...mockEntity, deleted: true };
      repo.find.mockResolvedValue([mockEntity, entityDeleted]);

      const result = await service.getDatoTodos({ usuarioId: 'u1' });

      expect(result).toHaveLength(2);
      expect(repo.find).toHaveBeenCalled();
    });

    it('[camino feliz] debería retornar array vacío si no hay datos', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.getDatoTodos({ usuarioId: 'u1' });

      expect(result).toEqual([]);
    });

    it('[transacción] debería usar qR.manager.find si se provee QueryRunner', async () => {
      manager.find.mockResolvedValue([mockEntity]);

      const result = await service.getDatoTodos({ usuarioId: 'u1', qR: qr });

      expect(manager.find).toHaveBeenCalled();
      expect(repo.find).not.toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });

    it('[error] debería llamar handleExceptions si el repositorio falla', async () => {
      repo.find.mockRejectedValue(new Error('DB error'));

      await expect(service.getDatoTodos({ usuarioId: 'u1' })).rejects.toThrow();
      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 getDatoById
  ========================= */

  describe('getDatoById', () => {
    it('[camino feliz] debería retornar el dato cuando existe', async () => {
      repo.findOne.mockResolvedValue(mockEntity);

      const result = await service.getDatoById({ id: mockEntity.id, usuarioId: 'u1' });

      expect(result).toEqual(mockEntity);
      expect(repo.findOne).toHaveBeenCalledTimes(1);
    });

    it('[camino feliz] debería retornar null si el dato no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.getDatoById({ id: 'id-inexistente', usuarioId: 'u1' });

      expect(result).toBeNull();
    });

    it('[transacción] debería usar qR.manager.findOne si se provee QueryRunner', async () => {
      manager.findOne.mockResolvedValue(mockEntity);

      const result = await service.getDatoById({ id: mockEntity.id, usuarioId: 'u1', qR: qr });

      expect(manager.findOne).toHaveBeenCalled();
      expect(repo.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });

    it('[error] debería llamar handleExceptions si el repositorio falla', async () => {
      repo.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.getDatoById({ id: '1', usuarioId: 'u1' })).rejects.toThrow();
      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 getDatoByIdOrFail
  ========================= */

  describe('getDatoByIdOrFail', () => {
    it('[camino feliz] debería devolver el dato si existe y no está eliminado', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue(mockEntity);

      const result = await service.getDatoByIdOrFail({ id: mockEntity.id, usuarioId: 'u1' });

      expect(result).toEqual(mockEntity);
    });

    it('[error] debería lanzar NotFoundException si el dato no existe (null)', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue(null);

      await expect(
        service.getDatoByIdOrFail({ id: 'id-inexistente', usuarioId: 'u1' })
      ).rejects.toThrow(NotFoundException);
    });

    it('[error] debería lanzar NotFoundException si el dato tiene deleted = true', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue({ ...mockEntity, deleted: true });

      await expect(
        service.getDatoByIdOrFail({ id: mockEntity.id, usuarioId: 'u1' })
      ).rejects.toThrow(NotFoundException);
    });

    it('[error] debería incluir entidadError en el mensaje de error si se provee', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue(null);

      await expect(
        service.getDatoByIdOrFail({ id: '1', usuarioId: 'u1', entidadError: 'sede' })
      ).rejects.toThrow(/sede/);
    });

    it('[transacción] debería usar QueryRunner al buscar el dato internamente', async () => {
      manager.findOne.mockResolvedValue(mockEntity);

      const result = await service.getDatoByIdOrFail({ id: mockEntity.id, usuarioId: 'u1', qR: qr });

      expect(manager.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  /* =========================
     🔹 getDatoByName
  ========================= */

  describe('getDatoByName', () => {
    it('[camino feliz] debería retornar el dato cuando existe con ese nombre', async () => {
      repo.findOne.mockResolvedValue(mockEntity);

      const result = await service.getDatoByName({ dato: 'Test', usuarioId: 'u1' });

      expect(result).toEqual(mockEntity);
      expect(repo.findOne).toHaveBeenCalledTimes(1);
    });

    it('[camino feliz] debería retornar null si no existe dato con ese nombre', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.getDatoByName({ dato: 'Inexistente', usuarioId: 'u1' });

      expect(result).toBeNull();
    });

    it('[transacción] debería usar qR.manager.findOne si se provee QueryRunner', async () => {
      manager.findOne.mockResolvedValue(mockEntity);

      const result = await service.getDatoByName({ dato: 'Test', usuarioId: 'u1', qR: qr });

      expect(manager.findOne).toHaveBeenCalled();
      expect(repo.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });

    it('[error] debería llamar handleExceptions si el repositorio falla', async () => {
      repo.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.getDatoByName({ dato: 'Test', usuarioId: 'u1' })).rejects.toThrow();
      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 getDatosByNombres
  ========================= */

  describe('getDatosByNombres', () => {
    it('[camino feliz] debería retornar los datos que coincidan con los nombres', async () => {
      repo.find.mockResolvedValue([mockEntity]);

      const result = await service.getDatosByNombres({ nombres: ['Test'], usuarioId: 'u1' });

      expect(result).toEqual([mockEntity]);
      expect(repo.find).toHaveBeenCalled();
    });

    it('[camino feliz] debería retornar array vacío si se pasa lista de nombres vacía', async () => {
      const result = await service.getDatosByNombres({ nombres: [], usuarioId: 'u1' });

      expect(result).toEqual([]);
      expect(repo.find).not.toHaveBeenCalled();
    });

    it('[transacción] debería usar qR.manager.find si se provee QueryRunner', async () => {
      manager.find.mockResolvedValue([mockEntity]);

      const result = await service.getDatosByNombres({ nombres: ['Test'], usuarioId: 'u1', qR: qr });

      expect(manager.find).toHaveBeenCalled();
      expect(repo.find).not.toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });

    it('[error] debería llamar handleExceptions si el repositorio falla', async () => {
      repo.find.mockRejectedValue(new Error('DB error'));

      await expect(
        service.getDatosByNombres({ nombres: ['Test'], usuarioId: 'u1' })
      ).rejects.toThrow();
      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 getDatosByIds
  ========================= */

  describe('getDatosByIds', () => {
    it('[camino feliz] debería retornar múltiples datos por ids', async () => {
      const entity2 = { ...mockEntity, id: 'otro-id' };
      jest
        .spyOn(service, 'getDatoByIdOrFail')
        .mockResolvedValueOnce(mockEntity)
        .mockResolvedValueOnce(entity2);

      const result = await service.getDatosByIds({
        ids: [mockEntity.id, 'otro-id'],
        usuarioId: 'u1',
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockEntity);
      expect(result[1]).toEqual(entity2);
    });

    it('[error] debería propagar NotFoundException si algún id no existe', async () => {
      jest
        .spyOn(service, 'getDatoByIdOrFail')
        .mockResolvedValueOnce(mockEntity)
        .mockRejectedValueOnce(new NotFoundException('No encontrado'));

      await expect(
        service.getDatosByIds({ ids: [mockEntity.id, 'id-inexistente'], usuarioId: 'u1' })
      ).rejects.toThrow();
      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });

    it('[transacción] debería propagar el QueryRunner a getDatoByIdOrFail', async () => {
      const spy = jest
        .spyOn(service, 'getDatoByIdOrFail')
        .mockResolvedValue(mockEntity);

      await service.getDatosByIds({ ids: [mockEntity.id], usuarioId: 'u1', qR: qr });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ qR: qr })
      );
    });
  });

  /* =========================
     🔹 softDelete
  ========================= */

  describe('softDelete', () => {
    it('[camino feliz] debería marcar deleted=true y retornar true', async () => {
      const entityActivo = { ...mockEntity, deleted: false };
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(entityActivo);
      repo.save.mockResolvedValue({ ...entityActivo, deleted: true });

      const result = await service.softDelete({
        id: mockEntity.id,
        usuarioId: 'u1',
        entidad: 'testEntity',
      } as any);

      expect(result).toBe(true);
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ deleted: true }));
    });

    it('[camino feliz] debería emitir evento gateway al hacer soft delete', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue({ ...mockEntity, deleted: false });
      repo.save.mockResolvedValue(mockEntity);

      await service.softDelete({ id: mockEntity.id, usuarioId: 'u1', entidad: 'testEntity' } as any);

      expect(mockGateway.actualizacionDato).toHaveBeenCalledTimes(1);
    });

    it('[transacción] debería usar qR.manager.save si se provee QueryRunner', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue({ ...mockEntity, deleted: false });
      manager.save.mockResolvedValue({ ...mockEntity, deleted: true });

      const result = await service.softDelete({
        id: mockEntity.id,
        usuarioId: 'u1',
        entidad: 'testEntity',
        qR: qr,
      } as any);

      expect(result).toBe(true);
      expect(manager.save).toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('[error] debería propagar el error si getDatoByIdOrFail falla', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(new NotFoundException('No existe'));

      await expect(
        service.softDelete({ id: 'id-inexistente', usuarioId: 'u1', entidad: 'testEntity' } as any)
      ).rejects.toThrow();
      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });

    it('[error] debería lanzar error si save retorna falsy', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue({ ...mockEntity, deleted: false });
      repo.save.mockResolvedValue(null as any);

      await expect(
        service.softDelete({ id: mockEntity.id, usuarioId: 'u1', entidad: 'testEntity' } as any)
      ).rejects.toThrow();
    });
  });

  /* =========================
     🔹 undoDelete
  ========================= */

  describe('undoDelete', () => {
    it('[camino feliz] debería revertir deleted a false y retornar true', async () => {
      const entityEliminado = { ...mockEntity, deleted: true };
      jest.spyOn(service, 'getDatoById').mockResolvedValue(entityEliminado);
      repo.save.mockResolvedValue({ ...entityEliminado, deleted: false });

      const result = await service.undoDelete({
        id: mockEntity.id,
        usuarioId: 'u1',
        entidad: 'testEntity',
      } as any);

      expect(result).toBe(true);
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ deleted: false }));
    });

    it('[camino feliz] debería emitir evento gateway al restaurar', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue({ ...mockEntity, deleted: true });
      repo.save.mockResolvedValue(mockEntity);

      await service.undoDelete({ id: mockEntity.id, usuarioId: 'u1', entidad: 'testEntity' } as any);

      expect(mockGateway.actualizacionDato).toHaveBeenCalledTimes(1);
    });

    it('[transacción] debería usar qR.manager.save si se provee QueryRunner', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue({ ...mockEntity, deleted: true });
      manager.save.mockResolvedValue({ ...mockEntity, deleted: false });

      const result = await service.undoDelete({
        id: mockEntity.id,
        usuarioId: 'u1',
        entidad: 'testEntity',
        qR: qr,
      } as any);

      expect(result).toBe(true);
      expect(manager.save).toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('[transacción] no debería emitir gateway cuando se usa QueryRunner', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue({ ...mockEntity, deleted: true });
      manager.save.mockResolvedValue({ ...mockEntity, deleted: false });

      await service.undoDelete({
        id: mockEntity.id,
        usuarioId: 'u1',
        entidad: 'testEntity',
        qR: qr,
      } as any);

      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('[error] debería lanzar NotFoundException si el dato no existe', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue(null);

      await expect(
        service.undoDelete({ id: 'id-inexistente', usuarioId: 'u1', entidad: 'testEntity' } as any)
      ).rejects.toThrow(NotFoundException);
    });

    it('[error] debería lanzar error si save retorna falsy', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue({ ...mockEntity, deleted: true });
      repo.save.mockResolvedValue(null as any);

      await expect(
        service.undoDelete({ id: mockEntity.id, usuarioId: 'u1', entidad: 'testEntity' } as any)
      ).rejects.toThrow();
    });
  });

  /* =========================
     🔹 delete (físico)
  ========================= */

  describe('delete', () => {
    it('[camino feliz] debería eliminar físicamente el dato y retornar true', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockEntity);
      repo.remove.mockResolvedValue(mockEntity as any);

      const result = await service.delete({
        id: mockEntity.id,
        usuarioId: 'u1',
        entidad: 'testEntity',
      } as any);

      expect(result).toBe(true);
      expect(repo.remove).toHaveBeenCalledWith(mockEntity);
    });

    it('[camino feliz] debería emitir evento gateway al eliminar físicamente', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockEntity);
      repo.remove.mockResolvedValue(mockEntity as any);

      await service.delete({ id: mockEntity.id, usuarioId: 'u1', entidad: 'testEntity' } as any);

      expect(mockGateway.actualizacionDato).toHaveBeenCalledTimes(1);
    });

    it('[transacción] debería usar qR.manager.remove si se provee QueryRunner', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockEntity);
      (manager.remove as jest.MockedFunction<any>).mockResolvedValue(mockEntity);

      const result = await service.delete({
        id: mockEntity.id,
        usuarioId: 'u1',
        entidad: 'testEntity',
        qR: qr,
      } as any);

      expect(result).toBe(true);
      expect(manager.remove).toHaveBeenCalled();
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('[transacción] no debería emitir gateway cuando se usa QueryRunner', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockEntity);
      (manager.remove as jest.MockedFunction<any>).mockResolvedValue(mockEntity);

      await service.delete({
        id: mockEntity.id,
        usuarioId: 'u1',
        entidad: 'testEntity',
        qR: qr,
      } as any);

      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('[error] debería propagar el error si getDatoByIdOrFail falla', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(new NotFoundException('No existe'));

      await expect(
        service.delete({ id: 'id-inexistente', usuarioId: 'u1', entidad: 'testEntity' } as any)
      ).rejects.toThrow();
      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 createDatoCx (transacción)
  ========================= */

  describe('createDatoCx', () => {
    it('[camino feliz] debería crear el dato, hacer commit y retornar el DTO', async () => {
      jest.spyOn(service, 'createDato').mockResolvedValue(mockEntity);

      const result = await service.createDatoCx({
        usuario: { id: 'u1' } as any,
        dto: { nombre: 'Test' },
        entidad: 'testEntity',
      } as any);

      expect(qr.connect).toHaveBeenCalled();
      expect(qr.startTransaction).toHaveBeenCalled();
      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toMatchObject({ id: mockEntity.id, nombre: mockEntity.nombre });
    });

    it('[error] debería hacer rollback y lanzar error si createDato falla', async () => {
      jest.spyOn(service, 'createDato').mockRejectedValue(new Error('Error creando'));

      await expect(
        service.createDatoCx({
          usuario: { id: 'u1' } as any,
          dto: { nombre: 'Test' },
          entidad: 'testEntity',
        } as any)
      ).rejects.toThrow();

      expect(qr.rollbackTransaction).toHaveBeenCalled();
      expect(qr.commitTransaction).not.toHaveBeenCalled();
    });

    it('[error] debería llamar qR.release incluso cuando ocurre un error (finally)', async () => {
      jest.spyOn(service, 'createDato').mockRejectedValue(new Error('Fallo'));

      await expect(
        service.createDatoCx({
          usuario: { id: 'u1' } as any,
          dto: { nombre: 'Test' },
          entidad: 'testEntity',
        } as any)
      ).rejects.toThrow();

      expect(qr.release).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 updateElementoController (transacción)
  ========================= */

  describe('updateElementoController', () => {
    it('[camino feliz] debería actualizar el dato, hacer commit y retornar el DTO', async () => {
      jest
        .spyOn(service, 'updateDato')
        .mockResolvedValue({ dato: mockEntity, isQr: true });

      const result = await service.updateElementoController({
        usuario: { id: 'u1' } as any,
        dto: { nombre: 'Actualizado' },
        entidad: 'testEntity',
        id: mockEntity.id,
      } as any);

      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toMatchObject({ id: mockEntity.id });
    });

    it('[camino feliz] no debería emitir gateway si isQr es false', async () => {
      jest
        .spyOn(service, 'updateDato')
        .mockResolvedValue({ dato: mockEntity, isQr: false });

      await service.updateElementoController({
        usuario: { id: 'u1' } as any,
        dto: { nombre: 'Actualizado' },
        entidad: 'testEntity',
        id: mockEntity.id,
      } as any);

      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('[error] debería hacer rollback si updateDato falla', async () => {
      jest.spyOn(service, 'updateDato').mockRejectedValue(new Error('Error actualizando'));

      await expect(
        service.updateElementoController({
          usuario: { id: 'u1' } as any,
          dto: {},
          entidad: 'testEntity',
          id: mockEntity.id,
        } as any)
      ).rejects.toThrow();

      expect(qr.rollbackTransaction).toHaveBeenCalled();
      expect(qr.commitTransaction).not.toHaveBeenCalled();
    });

    it('[error] debería lanzar NotFoundException si updateDato retorna falsy', async () => {
      jest.spyOn(service, 'updateDato').mockResolvedValue(null as any);

      await expect(
        service.updateElementoController({
          usuario: { id: 'u1' } as any,
          dto: {},
          entidad: 'testEntity',
          id: mockEntity.id,
        } as any)
      ).rejects.toThrow(NotFoundException);
    });

    it('[error] debería llamar qR.release incluso cuando ocurre un error (finally)', async () => {
      jest.spyOn(service, 'updateDato').mockRejectedValue(new Error('Fallo'));

      await expect(
        service.updateElementoController({
          usuario: { id: 'u1' } as any,
          dto: {},
          entidad: 'testEntity',
          id: mockEntity.id,
        } as any)
      ).rejects.toThrow();

      expect(qr.release).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 createElementoDefault
  ========================= */

  describe('createElementoDefault', () => {
    it('[camino feliz] debería crear todos los elementos del array defecto', async () => {
      const entity2 = { ...mockEntity, id: 'id-2', nombre: 'Default 2' };
      jest
        .spyOn(service, 'createDato')
        .mockResolvedValueOnce(mockEntity)
        .mockResolvedValueOnce(entity2);

      const result = await service.createElementoDefault({
        usuario: { id: 'u1' } as any,
        qR: qr,
        entidad: 'testEntity',
        defecto: [{ nombre: 'Default 1' }, { nombre: 'Default 2' }],
        entidadError: 'TestEntity',
      } as any);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockEntity);
      expect(result[1]).toEqual(entity2);
    });

    it('[camino feliz] debería retornar array vacío si defecto está vacío', async () => {
      const result = await service.createElementoDefault({
        usuario: { id: 'u1' } as any,
        qR: qr,
        entidad: 'testEntity',
        defecto: [],
        entidadError: 'TestEntity',
      } as any);

      expect(result).toEqual([]);
    });

    it('[error] debería llamar handleExceptions si createDato falla', async () => {
      jest.spyOn(service, 'createDato').mockRejectedValue(new Error('Error en createDato'));

      await expect(
        service.createElementoDefault({
          usuario: { id: 'u1' } as any,
          qR: qr,
          entidad: 'testEntity',
          defecto: [{ nombre: 'Default' }],
          entidadError: 'TestEntity',
        } as any)
      ).rejects.toThrow();

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 mergeSelected (método protegido expuesto)
  ========================= */

  describe('mergeSelected', () => {
    it('[camino feliz] debería mergear propiedades simples de ambos objetos', () => {
      type T = { a: string; b: string };
      const base: SelectedDeep<T> = { a: true };
      const override: SelectedDeep<T> = { b: true };

      const result = service.testMergeSelected<T>(base, override);

      expect(result).toEqual({ a: true, b: true });
    });

    it('[camino feliz] debería mergear objetos anidados recursivamente', () => {
      type T = { user: { id: number; nombre: string } };
      const base: SelectedDeep<T> = { user: { id: true } };
      const override: SelectedDeep<T> = { user: { nombre: true } };

      const result = service.testMergeSelected<T>(base, override);

      expect(result).toEqual({ user: { id: true, nombre: true } });
    });

    it('[camino feliz] debería retornar override si base es undefined', () => {
      type T = { a: string };
      const override: SelectedDeep<T> = { a: true };

      const result = service.testMergeSelected<T>(undefined, override);

      expect(result).toEqual({ a: true });
    });

    it('[camino feliz] override debería tener prioridad sobre base en conflicto', () => {
      type T = { a: string };
      const base: SelectedDeep<T> = { a: true };
      const override: SelectedDeep<T> = { a: true };

      const result = service.testMergeSelected<T>(base, override);

      expect(result).toEqual({ a: true });
    });
  });

  /* =========================
     🔹 mergeRelations (método protegido expuesto)
  ========================= */

  describe('mergeRelations', () => {
    it('[camino feliz] debería retornar BASE_RELATIONS si no se provee nada', () => {
      const result = service.testMergeRelations();

      expect(result).toHaveLength(1);
    });

    it('[camino feliz] debería retornar solo la relacionBase si no hay input', () => {
      const relacionBase = { relations: ['user' as any] };
      const result = service.testMergeRelations(undefined, relacionBase);

      expect(result).toEqual([relacionBase]);
    });

    it('[camino feliz] debería mergear input con relacionBase', () => {
      const relacionBase = { relations: ['user' as any] };
      const input = { relations: ['cliente' as any] };

      const result = service.testMergeRelations(input, relacionBase);

      expect(result[0].relations).toContain('user');
      expect(result[0].relations).toContain('cliente');
    });

    it('[camino feliz] debería aceptar un array de inputs y mergearlos todos', () => {
      const relacionBase = { relations: ['user' as any] };
      const inputs = [
        { relations: ['cliente' as any] },
        { relations: ['sede' as any] },
      ];

      const result = service.testMergeRelations(inputs, relacionBase);

      expect(result[0].relations).toContain('user');
      expect(result[0].relations).toContain('cliente');
      expect(result[0].relations).toContain('sede');
    });
  });
});