import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { mockGateway } from 'test/mock/gateway.mocks';
import { mockResumen } from 'test/mock/resumen.mock';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mockUser } from 'test/mock/user.mock';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockQueryRunner, mockDataSource } from 'test/mock/qR.mock';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { ClienteResumen } from '../entity/clienteResumen.entity';
import { ClienteResumenService } from '../cliente_resumen.service';
import { Estado } from '@src/interface/estado.interface';
import { DtoResumenEditar } from '../dto/clienteResumenEditar.dto';

jest.mock('@src/cliente/entity/cliente.entity', () => ({
  Cliente: class { },
}));

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

const mockRepo = createMockRepository<ClienteResumen>();
const { qr, manager } = createMockQueryRunner<ClienteResumen>();

describe('ClienteResumenService', () => {
  let service: ClienteResumenService;
  let repo: Repository<ClienteResumen>;
  let erroresService: ErroresService;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteResumenService,
        {
          provide: getRepositoryToken(ClienteResumen),
          useValue: mockRepo,
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
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ClienteResumenService>(ClienteResumenService);
    repo = module.get(getRepositoryToken(ClienteResumen));
    erroresService = module.get(ErroresService);
  });


  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('createDato', () => {

    it('debería crear cliente resumen (camino feliz)', async () => {
      const newMockResumen: ClienteResumen = new ClienteResumen();
      mockRepo.save.mockResolvedValue(newMockResumen);

      const result = await service.createDato({
        usuario: mockUser,
        dto: {},
        entidad: Entidad.RESUMEN
      });

      expect(result).toEqual(newMockResumen);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });


    it('debería usar QueryRunner si se provee', async () => {
      manager.save.mockResolvedValue(mockResumen);

      const result = await service.createDato({
        usuario: mockUser,
        dto: { estado: Estado.PENDIENTE },
        entidad: Entidad.RESUMEN,
        qR: qr
      });

      expect(result).toEqual(mockResumen);
      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('debería llamar al gateway cuando no hay QueryRunner', async () => {
      mockRepo.save.mockResolvedValue(mockResumen);

      await service.createDato({
        usuario: mockUser,
        dto: { estado: Estado.PENDIENTE },
        entidad: Entidad.RESUMEN,
      });

      expect(mockGateway.actualizacionDato).toHaveBeenCalledWith(
        expect.objectContaining({
          mensaje: expect.anything(),
          entidad: Entidad.RESUMEN,
          dato: mockResumen
        })
      );
    });

    it('debería manejar errores del repositorio', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockRepo.save.mockRejectedValue(dbError); // 🔥 ESTO FALTABA

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.createDato({
          usuario: mockUser,
          dto: { estado: Estado.PENDIENTE },
          entidad: Entidad.RESUMEN,
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.any(String)
      );
    });
  });

  describe('updateDato', () => {

    it('debería actualizar el resumen del cliente (camino feliz)', async () => {

      const resumenReal = new ClienteResumen();
      Object.assign(resumenReal, mockResumen);

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(resumenReal);
      mockRepo.save.mockResolvedValue(mockResumen);

      const dto: DtoResumenEditar = { anterior: Estado.PENDIENTE, actual: Estado.LISTO };

      const result = await service.updateDato({
        id: mockResumen.id,
        usuarioId: mockUser.id,
        dto,
        entidad: Entidad.RESUMEN
      });

      expect(result).toEqual({
        dato: mockResumen,
        isQr: true
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });

    it('no debería actualizar si estados son equivalentes', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockResumen);

      const dto = {
        anterior: Estado.PENDIENTE,
        actual: Estado.IMPRESO_COMPLETO // ambos están en pendientes
      };

      const result = await service.updateDato({
        id: mockResumen.id,
        usuarioId: mockUser.id,
        dto,
        entidad: Entidad.RESUMEN
      });

      expect(result).toEqual({
        dato: mockResumen,
        isQr: false
      });

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('debería modificar correctamente los contadores', async () => {

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockResumen);
      mockRepo.save.mockResolvedValue(mockResumen);

      const dto = {
        anterior: Estado.PENDIENTE,
        actual: Estado.LISTO
      };

      const pendienteAntes = mockResumen.pendiente;
      const listoAntes = mockResumen.listo;

      await service.updateDato({
        id: mockResumen.id,
        usuarioId: mockUser.id,
        dto,
        entidad: Entidad.RESUMEN
      });

      expect(mockResumen.pendiente).toBe(pendienteAntes - 1);
      expect(mockResumen.listo).toBe(listoAntes + 1);
    });

    it('debería crear resumen sin estado (sin modificar flags)', async () => {
      mockRepo.save.mockImplementation((resumen) => Promise.resolve(resumen));

      const result = await service.createDato({
        usuario: mockUser,
        dto: {},
        entidad: Entidad.RESUMEN
      });

      expect(result.pendiente).toBe(0);
      expect(result.listo).toBe(0);
      expect(result.retirado).toBe(0);
    });

    it('debería usar QueryRunner si se provee', async () => {
      const resumenBase = mockResumen;

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(resumenBase);
      manager.save.mockResolvedValue(resumenBase);

      const dto: DtoResumenEditar = { anterior: Estado.PENDIENTE, actual: Estado.LISTO };

      const result = await service.updateDato({
        id: mockResumen.id,
        usuarioId: mockUser.id,
        dto,
        entidad: Entidad.RESUMEN,
        qR: qr
      });

      expect(result).toEqual({
        dato: resumenBase,
        isQr: true
      });

      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('debería llamar al gateway si no hay QueryRunner', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockResumen);
      mockRepo.save.mockResolvedValue(mockResumen);


      const dto: DtoResumenEditar = { anterior: Estado.PENDIENTE, actual: Estado.LISTO };

      await service.updateDato({
        id: mockResumen.id,
        usuarioId: mockUser.id,
        dto,
        entidad: Entidad.RESUMEN
      });

      expect(mockGateway.actualizacionDato).toHaveBeenCalledWith(
        expect.objectContaining({
          mensaje: expect.anything(),
          entidad: Entidad.RESUMEN,
          dato: mockResumen
        })
      );
    });

    it('debería manejar error con QueryRunner', async () => {
      const error = new Error('QR fail');

      manager.save.mockRejectedValue(error);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw error });

      await expect(
        service.createDato({
          usuario: mockUser,
          dto: { estado: Estado.PENDIENTE },
          entidad: Entidad.RESUMEN,
          qR: qr
        })
      ).rejects.toThrow(error);
    });

    it('debería manejar error si falla getDatoByIdOrFail', async () => {
      const error = new Error('not found');

      jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(error);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw error });

      const dto: DtoResumenEditar = { anterior: Estado.PENDIENTE, actual: Estado.LISTO };

      await expect(
        service.updateDato({
          id: '1',
          usuarioId: mockUser.id,
          dto,
          entidad: Entidad.RESUMEN
        })
      ).rejects.toThrow(error);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });

    it('debería manejar error si falla el save', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockResumen);
      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });


      const dto: DtoResumenEditar = { anterior: Estado.PENDIENTE, actual: Estado.LISTO };

      await expect(
        service.updateDato({
          id: mockResumen.id,
          usuarioId: mockUser.id,
          dto,
          entidad: Entidad.RESUMEN
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });

  });
});