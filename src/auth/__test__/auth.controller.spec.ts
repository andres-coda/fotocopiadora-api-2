import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/auth.dto';
import { AuthParcialDto } from '../dto/authParcial.dto';
import { Role } from '../rol/rol.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
    getUserFromRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('signIn', () => {
    it('debería retornar el token si las credenciales son correctas', async () => {
      const loginDto: LoginDto = {
        email: 'juan@example.com',
        password: '123456',
      };

      const mockToken = { access_token: 'fake-jwt-token' };

      mockAuthService.signIn.mockResolvedValue(mockToken);

      const result = await controller.signIn(loginDto);

      expect(result).toEqual(mockToken);
      expect(authService.signIn).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });

    it('debería lanzar UnauthorizedException si las credenciales son inválidas', async () => {
      const loginDto: LoginDto = {
        email: 'juan@example.com',
        password: 'wrong-password',
      };

      mockAuthService.signIn.mockImplementation(() => {
        throw new UnauthorizedException('Credenciales inválidas');
      });

      await expect(controller.signIn(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(authService.signIn).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });
  });
  describe('getUserFromRequest', () => {
    it('debería retornar el usuario si el token es válido', async () => {
      const mockUser: AuthParcialDto = {
        sub: '1',
        email: 'juan@example.com',
        role: Role.User,
      };

      const mockRequest = {
        headers: {
          authorization: 'Bearer valid.token',
        },
      } as any;

      mockAuthService.getUserFromRequest.mockResolvedValue(mockUser);

      const result = await controller.getUserFromRequest(mockRequest);
      expect(result).toEqual(mockUser);
      expect(authService.getUserFromRequest).toHaveBeenCalledWith(mockRequest);
    });

    it('debería lanzar UnauthorizedException si el token no es válido', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid.token',
        },
      } as any;

      mockAuthService.getUserFromRequest.mockImplementation(() => {
        throw new UnauthorizedException('Token inválido');
      });

      await expect(controller.getUserFromRequest(mockRequest)).rejects.toThrow(UnauthorizedException);
      expect(authService.getUserFromRequest).toHaveBeenCalledWith(mockRequest);
    });
  });
});

