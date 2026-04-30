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

// ─── Mocks de módulos externos ───────────────────────────────────────────────

jest.mock('@src/base/entity/base.entity', () => ({ Base: class {} }));
jest.mock('@src/user/entity/user.entity', () => {
  return { User: jest.fn().mockImplementation(() => ({ deleted: false })) };
});

export const mockUserRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  target: {} as EntityTarget<User>,
} as unknown as jest.Mocked<Repository<User>>;


let qr: jest.Mocked<QueryRunner>;
let manager: jest.Mocked<EntityManager>;
// ─── Suite principal ──────────────────────────────────────────────────────────

describe('UserService', () => {
  let service: UserService;
  let repo: jest.Mocked<Repository<User>>;
  let erroresService: ErroresService;
  let gateway: GatewayGateway;
  let manager: ReturnType<typeof createMockQueryRunner>['manager'];

  beforeEach(async () => {
    const mockRepo = createMockRepository();
    const qrMock = createMockQueryRunner<User>();
    qr = qrMock.qr;
    manager = qrMock.manager;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
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
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(getRepositoryToken(User));
    erroresService = module.get(ErroresService);
    gateway = module.get(GatewayGateway);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  // ─── getDatoById ─────────────────────────────────────────────────────────────

  describe('getDatoById', () => {
    it('✅ retorna el usuario cuando existe', async () => {
      repo.findOne.mockResolvedValue(mockUser);

      const result = await service.getDatoById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('✅ retorna null cuando no existe el usuario', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.getDatoById(mockUser.id);

      expect(result).toBeNull();
    });

    it('❌ delega al erroresService si el repository lanza error', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');
      repo.findOne.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(service.getDatoById(mockUser.id)).rejects.toThrow(handledError);
      
      expect(erroresService.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.stringContaining(mockUser.id),
      );
    });
  });

  // ─── getDatoByIdOrFail ────────────────────────────────────────────────────────

  describe('getDatoByIdOrFail', () => {
    it('✅ retorna el usuario cuando existe y no está eliminado', async () => {
      repo.findOne.mockResolvedValue(mockUser);

      const result = await service.getDatoByIdOrFail(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it('❌ lanza NotFoundException si el usuario no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      const handledError = new Error('Handled error');

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(service.getDatoByIdOrFail(mockUser.id)).rejects.toThrow(handledError);
    });

    it('❌ lanza NotFoundException si el usuario tiene deleted = true', async () => {
      repo.findOne.mockResolvedValue({ ...mockUser, deleted: true });
      const handledError = new NotFoundException('El usuario ha sido eliminado con anterioridad');

      await expect(service.getDatoByIdOrFail(mockUser.id)).rejects.toThrow(handledError);
    });

    it('❌ delega al erroresService si getDatoById lanza error inesperado', async () => {
      const dbError = new Error('unexpected');
      repo.findOne.mockRejectedValue(dbError);

      await expect(service.getDatoByIdOrFail(mockUser.id)).rejects.toThrow();
      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });

  // ─── getUserByEmail ───────────────────────────────────────────────────────────

  describe('getUserByEmail', () => {
    it('✅ retorna el usuario cuando el email existe', async () => {
      repo.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
    });

    it('❌ lanza NotFoundException si el email no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.getUserByEmail('noexiste@ej.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('❌ delega al erroresService si el repository lanza error', async () => {
      const dbError = new Error('DB error');
      repo.findOne.mockRejectedValue(dbError);

      await expect(service.getUserByEmail(mockUser.email)).rejects.toThrow();
      expect(erroresService.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.stringContaining(mockUser.email),
      );
    });
  });

  // ─── createUsuario ────────────────────────────────────────────────────────────

  describe('createUsuario', () => {
    it('✅ crea el usuario y hace commit de la transacción', async () => {
      manager.save.mockResolvedValue(mockUser);

      const result = await service.createUsuario(mockUsuarioCrear);

      expect(result).toEqual(mockUser);
      expect(qr.connect).toHaveBeenCalledTimes(1);
      expect(qr.startTransaction).toHaveBeenCalledTimes(1);
      expect(manager.save).toHaveBeenCalledWith(
        User,
        expect.objectContaining({
          nombre: mockUsuarioCrear.nombre,
          email: mockUsuarioCrear.email,
          password: mockUsuarioCrear.password,
          role: 'admin',
        }),
      );
      expect(qr.commitTransaction).toHaveBeenCalledTimes(1);
      expect(qr.rollbackTransaction).not.toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalledTimes(1);
    });

    it('❌ hace rollback y delega al erroresService si save falla', async () => {
      const dbError = new Error('save failed');
      manager.save.mockRejectedValue(dbError);

      await expect(service.createUsuario(mockUsuarioCrear)).rejects.toThrow();

      expect(qr.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(qr.commitTransaction).not.toHaveBeenCalled();
      // release SIEMPRE se llama, incluso tras error (bloque finally)
      expect(qr.release).toHaveBeenCalledTimes(1);
      expect(erroresService.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.stringContaining(mockUsuarioCrear.nombre),
      );
    });

    it('❌ hace rollback y libera el QR si manager.save retorna falsy', async () => {
      // manager.save retorna null → la guardia lanza NotFoundException
      manager.save.mockResolvedValue(null as unknown as User);

      await expect(service.createUsuario(mockUsuarioCrear)).rejects.toThrow();

      expect(qr.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(qr.release).toHaveBeenCalledTimes(1);
    });
  });

  // ─── updateUsuario ────────────────────────────────────────────────────────────

  describe('updateUsuario', () => {
    it('✅ actualiza y retorna el usuario correctamente', async () => {
      const usuarioActualizado: User = {
        ...mockUser,
        nombre: 'Nuevo Nombre',
        email: 'nuevo@ej.com',
      };

      // getDatoByIdOrFail internamente llama a getDatoById (repo.findOne)
      repo.findOne.mockResolvedValue(mockUser);
      repo.save.mockResolvedValue(usuarioActualizado);

      const result = await service.updateUsuario(mockUser.id, {
        nombre: 'Nuevo Nombre',
        email: 'nuevo@ej.com',
        password: 'nuevapass',
      });

      expect(result).toEqual(usuarioActualizado);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Nuevo Nombre',
          email: 'nuevo@ej.com',
          password: 'nuevapass',
        }),
      );
    });

    it('❌ lanza error si getDatoByIdOrFail no encuentra al usuario', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.updateUsuario(mockUser.id, mockUsuarioCrear),
      ).rejects.toThrow(NotFoundException);

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('❌ lanza error si el usuario está eliminado', async () => {
      repo.findOne.mockResolvedValue({ ...mockUser, deleted: true });

      await expect(
        service.updateUsuario(mockUser.id, mockUsuarioCrear),
      ).rejects.toThrow(NotFoundException);

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('❌ delega al erroresService si repo.save lanza error', async () => {
      const dbError = new Error('save error');
      repo.findOne.mockResolvedValue(mockUser);
      repo.save.mockRejectedValue(dbError);

      await expect(
        service.updateUsuario(mockUser.id, mockUsuarioCrear),
      ).rejects.toThrow();

      expect(erroresService.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.stringContaining(mockUser.id),
      );
    });
  });

  // ─── modifyUsuarioRole ────────────────────────────────────────────────────────

  describe('modifyUsuarioRole', () => {
    it('✅ actualiza el rol del usuario correctamente', async () => {
      const usuarioConNuevoRol: User = { ...mockUser, role: Role.Admin };
      repo.findOne.mockResolvedValue(mockUser);
      repo.save.mockResolvedValue(usuarioConNuevoRol);

      const result = await service.modifyUsuarioRole(mockUser.id, Role.Admin);

      expect(result.role).toBe(Role.Admin);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.Admin }),
      );
    });

    it('❌ lanza error si el usuario no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.modifyUsuarioRole(mockUser.id, Role.Admin),
      ).rejects.toThrow(NotFoundException);

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('❌ delega al erroresService si repo.save lanza error', async () => {
      const dbError = new Error('save error');
      repo.findOne.mockResolvedValue(mockUser);
      repo.save.mockRejectedValue(dbError);

      await expect(
        service.modifyUsuarioRole(mockUser.id, Role.Admin),
      ).rejects.toThrow();

      expect(erroresService.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.stringContaining(mockUser.id),
      );
    });
  });
});