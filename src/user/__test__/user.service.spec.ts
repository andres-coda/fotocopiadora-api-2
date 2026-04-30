import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, EntityTarget, QueryRunner, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mockUser, mockUsuarioCrear } from 'test/mock/user.mock';
import { UserService } from '../user.service';
import { User } from '../entity/user.entity';
import { ErroresService } from '@src/error/error.service';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';
import { createMockRepository } from 'test/mock/repo.mocks';
import { mockErrores } from 'test/mock/error.mocks';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { mockGateway } from 'test/mock/gateway.mocks';
import { Role } from '@src/auth/rol/rol.enum';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<Repository<User>>;
  let erroresService: jest.Mocked<ErroresService>;
  let dataSource: jest.Mocked<DataSource>;  

  const mockQueryRunner: jest.Mocked<QueryRunner> = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(),
          },
        },
        {
          provide: ErroresService,
          useValue: {
            handleExceptions: jest.fn((e) => {
              throw e;
            }),
          },
        },
        {
          provide: GatewayGateway,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get(UserService);
    repository = module.get(getRepositoryToken(User));
    erroresService = module.get(ErroresService);
    dataSource = module.get(DataSource);

    dataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===========================
  // getDatoById
  // ===========================
  describe('getDatoById', () => {
    it('✔️ debería devolver usuario', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.getDatoById('1');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalled();
    });

    it('❌ debería manejar error', async () => {
      repository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.getDatoById('1')).rejects.toThrow();
      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });

  // ===========================
  // getDatoByIdOrFail
  // ===========================
  describe('getDatoByIdOrFail', () => {
    it('✔️ debería devolver usuario válido', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue(mockUser);

      const result = await service.getDatoByIdOrFail('1');

      expect(result).toEqual(mockUser);
    });

    it('❌ debería lanzar error si no existe', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue(null);

      await expect(service.getDatoByIdOrFail('1')).rejects.toThrow(NotFoundException);
    });

    it('❌ debería lanzar error si está eliminado', async () => {
      jest.spyOn(service, 'getDatoById').mockResolvedValue({
        ...mockUser,
        deleted: true,
      });

      await expect(service.getDatoByIdOrFail('1')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================
  // getUserByEmail
  // ===========================
  describe('getUserByEmail', () => {
    it('✔️ debería devolver usuario', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserByEmail('test@mail.com');

      expect(result).toEqual(mockUser);
    });

    it('❌ debería lanzar error si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getUserByEmail('test@mail.com')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================
  // createUsuario
  // ===========================
  describe('createUsuario', () => {
    it('✔️ debería crear usuario correctamente', async () => {
      mockQueryRunner.manager.save.mockResolvedValue(mockUser);

      const result = await service.createUsuario(mockUsuarioCrear);

      expect(result).toEqual(mockUser);
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('❌ debería hacer rollback si falla', async () => {
      mockQueryRunner.manager.save.mockRejectedValue(new Error('fail'));

      await expect(service.createUsuario(mockUsuarioCrear)).rejects.toThrow();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });

  // ===========================
  // updateUsuario
  // ===========================
  describe('updateUsuario', () => {
    it('✔️ debería actualizar usuario', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.updateUsuario({id:mockUser.id, datos:mockUsuarioCrear});

      expect(result).toEqual(mockUser);
      expect(repository.save).toHaveBeenCalled();
    });

    it('❌ debería manejar error', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(new Error());

      await expect(service.updateUsuario({id:mockUser.id, datos:mockUsuarioCrear})).rejects.toThrow();
      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });

  // ===========================
  // modifyUsuarioRole
  // ===========================
  describe('modifyUsuarioRole', () => {
    it('✔️ debería modificar rol', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockUser);
      repository.save.mockResolvedValue({
        ...mockUser,
        role: Role.Admin,
      });

      const result = await service.modifyUsuarioRole({id:mockUser.id, role:Role.Admin});

      expect(result.role).toBe(Role.Admin);
    });

    it('❌ debería manejar error', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(new Error());

      await expect(service.modifyUsuarioRole({id:mockUser.id, role:Role.Admin})).rejects.toThrow();
      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });
});
