import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { PedidoItem } from '../entity/pedido_item.entity';
import { PedidoItemService } from '../pedido_item.service';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { LibroService } from '@src/libro/libro.service';
import { PedidoService } from '@src/pedido/pedido.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';

describe('PedidoItemService', () => {
  let service: PedidoItemService;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<any>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoItemService,
        { provide: getRepositoryToken(PedidoItem), useValue: createMockRepository<any>() as any },
        { provide: DataSource, useValue: createMockDataSource(qrMock.qr) },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
        { provide: LibroService, useValue: {} },
        { provide: PedidoService, useValue: {} },
      ],
    }).compile();
    service = module.get<PedidoItemService>(PedidoItemService);
    jest.clearAllMocks();
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
