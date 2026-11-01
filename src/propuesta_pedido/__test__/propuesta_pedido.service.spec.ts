import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Propuesta } from '../entity/propuesta_pedido.entity';
import { PropuestaService } from '../propuesta_pedido.service';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { LibroService } from '@src/libro/libro.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';

describe('PropuestaService', () => {
  let service: PropuestaService;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Propuesta>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropuestaService,
        { provide: getRepositoryToken(Propuesta), useValue: createMockRepository<Propuesta>() },
        { provide: DataSource, useValue: createMockDataSource(qrMock.qr) },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
        { provide: LibroService, useValue: {} },
      ],
    }).compile();
    service = module.get<PropuestaService>(PropuestaService);
    jest.clearAllMocks();
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
