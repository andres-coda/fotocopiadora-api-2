import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { UserService } from '../user.service';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<User>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: createMockRepository<User>() },
        { provide: DataSource, useValue: createMockDataSource(qrMock.qr) },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
