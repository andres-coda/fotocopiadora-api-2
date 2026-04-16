import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ErroresService } from '../error.service';

describe('ErroresService', () => {
  let service: ErroresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErroresService],
    }).compile();

    service = module.get<ErroresService>(ErroresService);
  });

  describe('handleExceptions', () => {

    it('debería mapear ConflictException a HttpException 409', () => {
      const error = new ConflictException('conflict error');

      try {
        service.handleExceptions(error, 'mensaje custom');
        throw new Error('Debería haber lanzado una excepción');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);

        const err = e as HttpException;

        expect(err.getStatus()).toBe(HttpStatus.CONFLICT);

        const response = err.getResponse() as any;
        expect(response.message).toBe('mensaje custom');
        expect(response.error).toBe('conflict error');
      }
    });

    it('debería relanzar HttpException sin modificar', () => {
      const error = new HttpException('error original', HttpStatus.BAD_REQUEST);

      try {
        service.handleExceptions(error, 'mensaje custom');
        throw new Error('Debería haber lanzado una excepción');
      } catch (e) {
        expect(e).toBe(error);

        const err = e as HttpException;
        expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('debería mapear error genérico a HttpException 500', () => {
      const error = new Error('boom');

      try {
        service.handleExceptions(error, 'mensaje custom');
        throw new Error('Debería haber lanzado una excepción');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);

        const err = e as HttpException;

        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const response = err.getResponse() as any;
        expect(response.message).toBe('mensaje custom');
        expect(response.error).toBe('boom');
      }
    });

    it('debería manejar error sin message (fallback)', () => {
      const error = { some: 'object without message' };

      try {
        service.handleExceptions(error, 'mensaje custom');
        throw new Error('Debería haber lanzado una excepción');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);

        const err = e as HttpException;

        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const response = err.getResponse() as any;
        expect(response.message).toBe('mensaje custom');
        expect(response.error).toEqual(error);
      }
    });

  });
});