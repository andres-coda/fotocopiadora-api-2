import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Libro } from '../entity/libro.entity';
import { LibroService } from '../libro.service';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { PropuestaService } from '@src/propuesta_pedido/propuesta_pedido.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';

describe('LibroService', () => {
  let service: LibroService;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<any>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LibroService,
        { provide: getRepositoryToken(Libro), useValue: createMockRepository<any>() as any },
        { provide: DataSource, useValue: createMockDataSource(qrMock.qr) },
        { provide: ErroresService, useValue: mockErrores },
        { provide: GatewayGateway, useValue: mockGateway },
        { provide: PropuestaService, useValue: {} },
      ],
    }).compile();
    service = module.get<LibroService>(LibroService);
    jest.clearAllMocks();
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
