import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { AuthService } from '@src/auth/auth.service';
import { Role } from '@src/auth/rol/rol.enum';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { AdminGuard } from '@src/auth/guard/admin.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: '1',
    email: 'test@mail.com',
    password: '123',
    role: 'admin',
  };

  const mockReq = {
    user: {
      sub: '1',
    },
  } as any;

  const mockDto = {
    nombre: 'Test',
    email: 'test@mail.com',
    password: '123',
  };

  beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [UserController],
    providers: [
      {
        provide: UserService,
        useValue: {
          getDatoByIdOrFail: jest.fn(),
          createUsuario: jest.fn(),
          updateUsuario: jest.fn(),
          modifyUsuarioRole: jest.fn(),
        },
      },
      {
        provide: AuthService,
        useValue: {
          signIn: jest.fn(),
        },
      },
    ],
  })
    .overrideGuard(UsuarioGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(AdminGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

  controller = module.get(UserController);
  userService = module.get(UserService);
  authService = module.get(AuthService);
});
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===========================
  // GET /user/:id
  // ===========================
  describe('getUsuarioById', () => {
    it('✔️ debería devolver usuario si es el mismo', async () => {
      userService.getDatoByIdOrFail.mockResolvedValue(mockUser as any);

      const result = await controller.getUsuarioById(mockReq, '1');

      expect(result).toEqual(mockUser);
      expect(userService.getDatoByIdOrFail).toHaveBeenCalledWith('1');
    });

    it('❌ debería lanzar error si no coincide el id', async () => {
      await expect(
        controller.getUsuarioById(mockReq, '2'),
      ).rejects.toThrow(NotFoundException);
    });

    it('❌ debería lanzar error si no hay usuario en request', async () => {
      await expect(
        controller.getUsuarioById({} as any, '1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================
  // POST /user
  // ===========================
  describe('createUsuario', () => {
    it('✔️ debería crear usuario y devolver token', async () => {
      userService.createUsuario.mockResolvedValue(mockUser as any);
      authService.signIn.mockResolvedValue({ access_token: 'token' });

      const result = await controller.createUsuario(mockDto as any);

      expect(result).toEqual({ access_token: 'token' });
      expect(userService.createUsuario).toHaveBeenCalledWith(mockDto);
      expect(authService.signIn).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.password,
      );
    });

    it('❌ debería lanzar error si no se crea el usuario', async () => {
      userService.createUsuario.mockResolvedValue(null as any);

      await expect(
        controller.createUsuario(mockDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================
  // PUT /user/:id
  // ===========================
  describe('updateUsuario', () => {
    it('✔️ debería actualizar usuario normal', async () => {
      userService.updateUsuario.mockResolvedValue(mockUser as any);

      const result = await controller.updateUsuario(
        mockReq,
        '1',
        mockDto as any,
      );

      expect(result).toEqual(mockUser);
      expect(userService.updateUsuario).toHaveBeenCalledWith('1', mockDto);
    });

    it('✔️ debería modificar rol si viene role', async () => {
      userService.modifyUsuarioRole.mockResolvedValue({
        ...mockUser,
        role: Role.Admin,
      } as any);

      const result = await controller.updateUsuario(
        mockReq,
        '1',
        { ...mockDto, role: Role.Admin } as any,
      );

      expect(userService.modifyUsuarioRole).toHaveBeenCalledWith('1', Role.Admin);
      expect(result.role).toBe(Role.Admin);
    });

    it('❌ debería lanzar error si no coincide el id', async () => {
      await expect(
        controller.updateUsuario(mockReq, '2', mockDto as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================
  // PUT /user/:id/role
  // ===========================
  describe('updateUsuarioRole', () => {
    it('✔️ debería modificar rol', async () => {
      userService.modifyUsuarioRole.mockResolvedValue({
        ...mockUser,
        role: Role.Admin,
      } as any);

      const result = await controller.updateUsuarioRole('1', {
        role: Role.Admin,
      } as any);

      expect(result.role).toBe(Role.Admin);
      expect(userService.modifyUsuarioRole).toHaveBeenCalledWith('1', Role.Admin);
    });

    it('❌ debería lanzar error si no viene role', async () => {
      await expect(
        controller.updateUsuarioRole('1', {} as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});