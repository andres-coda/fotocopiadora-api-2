import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { mockUser } from 'test/mock/user.mock';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { ClienteService } from '@src/cliente/cliente.service';
import { Pedido } from '../entity/pedido.entity';
import { mockCliente, mockClienteService } from 'test/mock/cliente.mock';
import { mockDtoPedidoCrear, mockDtoPedidoEditar, mockPedido } from 'test/mock/pedido.mock';
import { PedidoService } from '../pedido.service';

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

jest.mock('@src/cliente/entity/cliente.entity', () => ({
  Cliente: class { },
}));

jest.mock('@src/libro_pedido/entity/libroPedido.entity', () => ({
  LibroPedido: class { },
}));

const mockRepo = createMockRepository<Pedido>();
let qr: jest.Mocked<QueryRunner>;
let manager: jest.Mocked<EntityManager>;


describe('PedidoService', () => {
  let service: PedidoService;
  let repo: Repository<Pedido>;
  let erroresService: ErroresService;
  let gateway: GatewayGateway;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Pedido>();
    qr = qrMock.qr;
    manager = qrMock.manager;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoService,
        {
          provide: getRepositoryToken(Pedido),
          useValue: mockRepo,
        },
        {
          provide: DataSource,
          useValue: createMockDataSource(qr),
        },
        {
          provide: ErroresService,
          useValue: mockErrores,
        },
        {
          provide: GatewayGateway,
          useValue: mockGateway,
        },
        {
          provide: ClienteService,
          useValue: mockClienteService,
        }
      ],
    }).compile();


    service = module.get<PedidoService>(PedidoService);
    repo = module.get(getRepositoryToken(Pedido));
    erroresService = module.get(ErroresService);
    gateway = module.get(GatewayGateway);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  // ---------------- CREATE ----------------

  describe('createDato', () => {
    it('✔️ debería crear un pedido correctamente con el id del cliente', async () => {

      mockClienteService.getDatoByIdOrFail.mockResolvedValue(mockCliente);
      mockRepo.save.mockResolvedValue(mockPedido);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoPedidoCrear,
        entidad: Entidad.PEDIDO,
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toEqual(mockPedido);
    });

    it('✔️ debería crear un pedido correctamente con datos del cliente', async () => {
      mockClienteService.createDato.mockResolvedValue(mockCliente);
      mockRepo.save.mockResolvedValue(mockPedido);

      const result = await service.createDato({
        usuario: mockUser,
        dto: { ...mockDtoPedidoCrear, clienteDatos: { telefono: mockCliente.telefono } },
        entidad: Entidad.PEDIDO,
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toEqual(mockPedido);
    });

    it('🔁 debería usar QueryRunner si existe', async () => {
      mockClienteService.getDatoByIdOrFail.mockResolvedValue(mockCliente);
      manager.save.mockResolvedValue(mockPedido);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoPedidoCrear,
        entidad: Entidad.PEDIDO,
        qR: qr
      });

      expect(result).toEqual(mockPedido);
      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores con erroresService', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.createDato({
          usuario: mockUser,
          dto: mockDtoPedidoCrear,
          entidad: Entidad.PEDIDO,
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.any(String)
      );
    });
  });

  // ---------------- UPDATE ----------------

  describe('updateDato', () => {
    it('✔️ debería actualizar libro', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockPedido);

      mockRepo.save.mockResolvedValue(mockPedido);

      const result = await service.updateDato({
        usuarioId: mockUser.id,
        dto: mockDtoPedidoEditar,
        entidad: Entidad.PEDIDO,
        id: mockPedido.id,
      });


      expect(result).toEqual({
        dato: { ...mockPedido, sena:mockDtoPedidoEditar.sena },
        isQr: true
      });


      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner en update', async () => {

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockPedido);
      manager.save.mockResolvedValue(mockPedido);

      const result = await service.updateDato({
        usuarioId: mockUser.id,
        dto: mockDtoPedidoEditar,
        entidad: Entidad.PEDIDO,
        id: mockPedido.id,
        qR: qr
      });

      expect(result).toEqual({
        dato: { ...mockPedido, sena:mockDtoPedidoEditar.sena },
        isQr: true
      });

      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores en update', async () => {

      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockPedido);
      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.updateDato({
          usuarioId: mockUser.id,
          dto: mockDtoPedidoCrear,
          entidad: Entidad.PEDIDO,
          id: mockPedido.id,
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });
});