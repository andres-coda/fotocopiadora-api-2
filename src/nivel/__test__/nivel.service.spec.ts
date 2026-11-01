import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Nivel } from '../entity/nivel.entity';
import { NivelService } from '../nivel.service';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';

describe('NivelService', () => {
  let service: NivelService;
  let qr: QueryRunner;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Nivel>();
    qr = qrMock.qr;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NivelService,
        { provide: getRepositoryToken(Nivel), useValue: createMockRepository<Nivel>() },
        { provide: DataSource, useValue: createMockDataSource(qr) },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<NivelService>(NivelService);
    jest.clearAllMocks();
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
