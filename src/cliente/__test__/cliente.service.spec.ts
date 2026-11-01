import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Cliente } from '../entity/cliente.entity';
import { ClienteService } from '../cliente.service';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';

describe('ClienteService', () => {
  let service: ClienteService;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Cliente>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteService,
        { provide: getRepositoryToken(Cliente), useValue: createMockRepository<Cliente>() },
        { provide: DataSource, useValue: createMockDataSource(qrMock.qr) },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
      ],
    }).compile();
    service = module.get<ClienteService>(ClienteService);
    jest.clearAllMocks();
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
