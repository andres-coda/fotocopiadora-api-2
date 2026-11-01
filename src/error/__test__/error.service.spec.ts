import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { ErroresService } from '../error.service';

describe('ErroresService', () => {
  let service: ErroresService;

  beforeEach(() => {
    service = new ErroresService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería mapear ConflictException a HttpException 409', () => {
    const error = new ConflictException('conflict');

    expect(() => service.handleExceptions(error, 'msg')).toThrow(HttpException);
    try {
      service.handleExceptions(error, 'msg');
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(HttpStatus.CONFLICT);
    }
  });

  it('debería relanzar HttpException sin modificar', () => {
    const error = new HttpException('boom', HttpStatus.BAD_REQUEST);

    expect(() => service.handleExceptions(error, 'msg')).toThrow(error);
  });

  it('debería mapear error genérico a HttpException 500', () => {
    const error = new Error('generic');

    try {
      service.handleExceptions(error, 'msg');
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect((e as HttpException).message).toContain('msg');
    }
  });

  it('debería manejar error sin message (fallback)', () => {
    try {
      service.handleExceptions(null, 'msg');
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
});
