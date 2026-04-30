import { AuthService } from "../auth.service";
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { AuthParcialDto } from "../dto/authParcial.dto";
import { Role } from "../rol/rol.enum";
import { UserService } from "@src/user/user.service";
import { mockUser, mockUserService } from "test/mock/user.mock";
import { mockJwtService } from "test/mock/auth.mock";

describe('AuthService', () => {
  let service: AuthService;
  let usuarioService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuarioService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('signIn', () => {
    it('debería retornar el token si el email y password son correctos', async () => {
      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('fake-jwt-token');
      const result = await service.signIn(mockUser.email, mockUser.password);
      expect(result).toEqual({ access_token: 'fake-jwt-token' });
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      mockUserService.getUserByEmail.mockResolvedValue(null);
      await expect(service.signIn('nonexistent@example.com', '123456')).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      const usuarioIncorrecto = { ...mockUser, password: 'diferente' };
      mockUserService.getUserByEmail.mockResolvedValue(usuarioIncorrecto);
      await expect(service.signIn(mockUser.email, '123456')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getUserFromRequest', () => {
    it('debería retornar el usuario decodificado del token si es válido', async () => {
      const token = 'valid.token.here';
      const expectedUser: AuthParcialDto = {
        sub: '1',
        email: 'juan@ejemplo.com',
        role: Role.User,
      };

      const mockRequest = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as any;

      mockJwtService.verify.mockReturnValue(expectedUser);
      const result = await service.getUserFromRequest(mockRequest);
      expect(result).toEqual(expectedUser);
    });

    it('debería lanzar UnauthorizedException si no hay header de autorización', async () => {
      const mockRequest = {
        headers: {},
      } as any;
      await expect(service.getUserFromRequest(mockRequest)).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si el formato del token es incorrecto', async () => {
      const mockRequest = {
        headers: {
          authorization: 'InvalidTokenFormat',
        },
      } as any;

      await expect(service.getUserFromRequest(mockRequest)).rejects.toThrow('Formato de token no válido');
    });

    it('debería lanzar UnauthorizedException si el token es inválido', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid.token',
        },
      } as any;
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      await expect(service.getUserFromRequest(mockRequest)).rejects.toThrow('Token inválido');
    });
  });
});