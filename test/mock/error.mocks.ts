
import { jest } from '@jest/globals';
import { ErroresService } from '@src/error/error.service';

export const mockErrores: jest.Mocked<ErroresService> = {
  handleExceptions: jest.fn((error: unknown) => {
    throw error;
  }),
};