
import { jest } from '@jest/globals';
import { AuthParcialDto } from '@src/auth/dto/authParcial.dto';

export const mockJwtService = {
    signAsync: jest.fn<(params: { email: string, pass: string }) => Promise<{ access_token: string }| string>>(),
    verify: jest.fn(),
};

export const mockAuthService = {
    signIn: jest.fn<(params: { email: string, pass: string }) => Promise<{ access_token: string } | string>>(),
    getUserFromRequest: jest.fn<(params: Request) => Promise<AuthParcialDto>>(),
};