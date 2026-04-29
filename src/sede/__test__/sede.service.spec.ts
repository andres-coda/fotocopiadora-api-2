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
import { Sede } from '../entity/sede.entity';
import { SedeService } from '../sede.service';
import { mockDtoCrearSede, mockSede } from 'test/mock/sede.mock';

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

const mockRepo = createMockRepository<Sede>();
let qr: jest.Mocked<QueryRunner>;
let manager: jest.Mocked<EntityManager>;


describe('SedeService', () => {
  let service: SedeService;
  let repo: Repository<Sede>;
  let erroresService: ErroresService;
  let gateway: GatewayGateway;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Sede>();
    qr = qrMock.qr;
    manager = qrMock.manager;
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SedeService,
        {
          provide: getRepositoryToken(Sede),
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
        }
      ],
    }).compile();


    service = module.get<SedeService>(SedeService);
    repo = module.get(getRepositoryToken(Sede));
    erroresService = module.get(ErroresService);
    gateway = module.get(GatewayGateway);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  // ---------------- CREATE ----------------

  describe('createDato', () => {
    it('✔️ debería crear una sede correctamente', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      mockRepo.save.mockResolvedValue(mockSede);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearSede,
        entidad: Entidad.SEDE,
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toEqual(mockSede);
    });

    it('✔️ debería devolver una sede existente', async () => {
      const existente = mockSede;

      jest.spyOn(service, 'getDatoByName').mockResolvedValue(existente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearSede,
        entidad: Entidad.SEDE,
      });

      expect(result).toBe(existente);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner si existe', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      manager.save.mockResolvedValue(mockSede);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearSede,
        entidad: Entidad.SEDE,
        qR: qr
      });

      expect(result).toEqual(mockSede);
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
        dto: mockDtoCrearSede,
        entidad: Entidad.SEDE,
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
    it('✔️ debería actualizar una sede', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockSede);

      mockRepo.save.mockResolvedValue(mockSede);

      const result = await service.updateDato({
        usuarioId: mockUser.id,
        dto: mockDtoCrearSede,
        entidad: Entidad.SEDE,
        id: mockSede.id,
      });


      expect(result).toEqual({
        dato: mockSede,
        isQr: true
      });


      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner en update', async () => {

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockSede);
      manager.save.mockResolvedValue(mockSede);

      const result = await service.updateDato({
        id: mockSede.id,
        usuarioId: mockUser.id,
        dto: mockDtoCrearSede,
        entidad: Entidad.SEDE,
        qR: qr
      });

      expect(result).toEqual({
        dato: mockSede,
        isQr: true
      });

      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores en update', async () => {

      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockSede);
      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.updateDato({
          id: mockSede.id,
          usuarioId: mockUser.id,
          dto: mockDtoCrearSede,
          entidad: Entidad.SEDE
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });
});