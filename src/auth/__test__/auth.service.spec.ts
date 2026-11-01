import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DataSource, useValue: { query: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'token'), verify: jest.fn() } },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
