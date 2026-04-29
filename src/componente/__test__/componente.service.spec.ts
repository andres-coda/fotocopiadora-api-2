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
import { Componente } from '../entity/componente.entity';
import { ComponenteService } from '../componente.service';
import { mockComponente, mockDtoCrearComponente } from 'test/mock/componente.mock';

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

const mockRepo = createMockRepository<Componente>();
let qr: jest.Mocked<QueryRunner>;
let manager: jest.Mocked<EntityManager>;


describe('ComponenteService', () => {
  let service: ComponenteService;
  let repo: Repository<Componente>;
  let erroresService: ErroresService;
  let gateway: GatewayGateway;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Componente>();
    qr = qrMock.qr;
    manager = qrMock.manager;
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComponenteService,
        {
          provide: getRepositoryToken(Componente),
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


    service = module.get<ComponenteService>(ComponenteService);
    repo = module.get(getRepositoryToken(Componente));
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
      mockRepo.save.mockResolvedValue(mockComponente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearComponente,
        entidad: Entidad.COMPONENTE,
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toEqual(mockComponente);
    });

    it('✔️ debería devolver una sede existente', async () => {
      const existente = mockComponente;

      jest.spyOn(service, 'getDatoByName').mockResolvedValue(existente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearComponente,
        entidad: Entidad.COMPONENTE,
      });

      expect(result).toBe(existente);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner si existe', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      manager.save.mockResolvedValue(mockComponente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearComponente,
        entidad: Entidad.COMPONENTE,
        qR: qr
      });

      expect(result).toEqual(mockComponente);
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
        dto: mockDtoCrearComponente,
        entidad: Entidad.COMPONENTE,
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
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockComponente);

      mockRepo.save.mockResolvedValue(mockComponente);

      const result = await service.updateDato({
        usuarioId: mockUser.id,
        dto: mockDtoCrearComponente,
        entidad: Entidad.COMPONENTE,
        id: mockComponente.id,
      });


      expect(result).toEqual({
        dato: mockComponente,
        isQr: true
      });


      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner en update', async () => {

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockComponente);
      manager.save.mockResolvedValue(mockComponente);

      const result = await service.updateDato({
        id: mockComponente.id,
        usuarioId: mockUser.id,
        dto: mockDtoCrearComponente,
        entidad: Entidad.COMPONENTE,
        qR: qr
      });

      expect(result).toEqual({
        dato: mockComponente,
        isQr: true
      });

      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores en update', async () => {

      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockComponente);
      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.updateDato({
          id: mockComponente.id,
          usuarioId: mockUser.id,
          dto: mockDtoCrearComponente,
          entidad: Entidad.COMPONENTE
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });
});