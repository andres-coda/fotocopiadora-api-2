import { Test, TestingModule } from '@nestjs/testing';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EspecificacionService, GetEspNombres } from '../especificacion.service';
import { Especificacion } from '../entity/especificacion.entity';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockQueryRunner, mockDataSource } from 'test/mock/qR.mock';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { mockEsp } from 'test/mock/esp.mock';
import { mockUser } from 'test/mock/user.mock';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { DtoEspecificacionEditar } from '../dto/DtoEditarEspecificacion.dto';
import { Especificaciones } from '@src/libro_pedido/interface/especificaciones.interface';

jest.mock('@src/especificacion/entity/especificacion.entity', () => ({
  Especificacion: class { },
}));

jest.mock('@src/libro_pedido/entity/libroPedido.entity', () => ({
  LibroPedido: class { },
}));

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

const mockRepo = createMockRepository<Especificacion>();
const { qr, manager } = createMockQueryRunner<Especificacion>();

describe('EspecificacionService', () => {
  let service: EspecificacionService;
  let repo: Repository<Especificacion>;
  let erroresService: ErroresService;
  let gateway: GatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EspecificacionService,
        {
          provide: getRepositoryToken(Especificacion),
          useValue: mockRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ErroresService,
          useValue: mockErrores,
        },
        {
          provide: GatewayGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<EspecificacionService>(EspecificacionService);
    repo = module.get(getRepositoryToken(Especificacion));
    erroresService = module.get(ErroresService);
    gateway = module.get(GatewayGateway);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('createDato', () => {

    it('✅ debería crear una especificación (sin transacción)', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      mockRepo.save.mockResolvedValue(mockEsp);

      const result = await service.createDato({
        usuario: mockUser,
        dto: { nombre: mockEsp.nombre },
        entidad: Entidad.ESP,
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toEqual(mockEsp);
    });

    it('✅ debería devolver existente si ya existe', async () => {
      const existente = mockEsp;

      jest.spyOn(service, 'getDatoByName').mockResolvedValue(existente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: { nombre: mockEsp.nombre },
        entidad: Entidad.ESP,
      });

      expect(result).toBe(existente);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner si existe', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      manager.save.mockResolvedValue(mockEsp);

      const result = await service.createDato({
        usuario: mockUser,
        dto: { nombre: mockEsp.nombre },
        entidad: Entidad.ESP,
        qR: qr
      });

      expect(result).toEqual(mockEsp);
      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores con erroresService', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockRepo.save.mockRejectedValue(dbError); // 🔥 ESTO FALTABA

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.createDato({
          usuario: mockUser,
          dto: { nombre: mockEsp.nombre },
          entidad: Entidad.ESP,
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.any(String)
      );
    });

  });

  describe('updateDato', () => {

    it('✅ debería actualizar correctamente', async () => {

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockEsp);
      mockRepo.save.mockResolvedValue(mockEsp);

      const result = await service.updateDato({
        usuarioId: mockUser.id,
        dto: { nombre: mockEsp.nombre },
        entidad: Entidad.ESP,
        id: mockEsp.id,
      });

      expect(result).toEqual({
        dato: mockEsp,
        isQr: true
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner en update', async () => {

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockEsp);
      manager.save.mockResolvedValue(mockEsp);

      const result = await service.updateDato({
        id: mockEsp.id,
        usuarioId: mockUser.id,
        dto: { nombre: mockEsp.nombre },
        entidad: Entidad.ESP,
        qR: qr
      });

      expect(result).toEqual({
        dato: mockEsp,
        isQr: true
      });

      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores en update', async () => {

      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockEsp);
      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });


      const dto: DtoEspecificacionEditar = { nombre: Especificaciones.ANILLADO };

      await expect(
        service.updateDato({
          id: mockEsp.id,
          usuarioId: mockUser.id,
          dto,
          entidad: Entidad.ESP
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });

  describe('getDatosByNombres', () => {

    it('✅ debería retornar vacío si nombres está vacío', async () => {
      const dto: GetEspNombres = {
        nombres: [],
        usuarioId: mockUser.id,
        entidadError: 'especificaciones',
      }
      const result = await service.getDatosByNombres(dto);

      expect(result).toEqual([]);
    });

    it('✅ debería buscar en repository', async () => {
      const dto: GetEspNombres = {
        nombres: [mockEsp.nombre],
        usuarioId: mockUser.id,
        entidadError: 'especificaciones',
      }
      mockRepo.find.mockResolvedValue([mockEsp]);

      jest.spyOn(service as any, 'crearCriterio').mockReturnValue({});

      const result = await service.getDatosByNombres(dto);

      expect(repo.find).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result).toEqual([mockEsp]);
    });

    it('🔁 debería usar QueryRunner', async () => {
      manager.save.mockResolvedValue(mockEsp);

      jest.spyOn(service as any, 'crearCriterio').mockReturnValue({});
      const dto: GetEspNombres = {
        nombres: [mockEsp.nombre],
        usuarioId: mockUser.id,
        entidadError: 'especificaciones',
        qR: qr
      }

      await service.getDatosByNombres(dto);

      expect(qr.manager.find).toHaveBeenCalled();
    });

    it('❌ debería manejar errores', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service as any, 'crearCriterio').mockImplementation(() => {
        throw dbError;
      });

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.updateDato({
          id: mockEsp.id,
          usuarioId: mockUser.id,
          dto: { nombre: mockEsp.nombre },
          entidad: Entidad.ESP
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });

  });

});