import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Pedido } from '../entity/pedido.entity';
import { PedidoService } from '../pedido.service';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';

describe('PedidoService', () => {
  let service: PedidoService;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Pedido>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoService,
        { provide: getRepositoryToken(Pedido), useValue: createMockRepository<Pedido>() },
        { provide: DataSource, useValue: createMockDataSource(qrMock.qr) },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
      ],
    }).compile();
    service = module.get<PedidoService>(PedidoService);
    jest.clearAllMocks();
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
