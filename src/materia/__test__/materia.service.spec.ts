import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { MateriaService } from '@src/materia/materia.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { mockDtoCrearMateria, mockMateria, mockMateriaService } from 'test/mock/materia.mock';
import { mockUser } from 'test/mock/user.mock';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Materia } from '../entity/materia.entity';

jest.mock('@src/libro/entity/libro.entity', () => ({
  Libro: class { },
}));

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

const mockRepo = createMockRepository<Materia>();
let qr: jest.Mocked<QueryRunner>;
let manager: jest.Mocked<EntityManager>;


describe('MateriaService', () => {
  let service: MateriaService;
  let repo: Repository<Materia>;
  let erroresService: ErroresService;
  let gateway: GatewayGateway;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Materia>();
    qr = qrMock.qr;
    manager = qrMock.manager;
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MateriaService,
        {
          provide: getRepositoryToken(Materia),
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


    service = module.get<MateriaService>(MateriaService);
    repo = module.get(getRepositoryToken(Materia));
    erroresService = module.get(ErroresService);
    gateway = module.get(GatewayGateway);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  // ---------------- CREATE ----------------

  describe('createDato', () => {
    it('✔️ debería crear una materia correctamente', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      mockRepo.save.mockResolvedValue(mockMateria);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearMateria,
        entidad: Entidad.MATERIA,
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toEqual(mockMateria);
    });

    it('✔️ debería devolver materia existente', async () => {
      const existente = mockMateria;

      jest.spyOn(service, 'getDatoByName').mockResolvedValue(existente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearMateria,
        entidad: Entidad.MATERIA,
      });

      expect(result).toBe(existente);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner si existe', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      manager.save.mockResolvedValue(mockMateria);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearMateria,
        entidad: Entidad.MATERIA,
        qR: qr
      });

      expect(result).toEqual(mockMateria);
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
        dto: mockDtoCrearMateria,
        entidad: Entidad.MATERIA,
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
    it('✔️ debería actualizar precio', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockMateria);

      mockRepo.save.mockResolvedValue(mockMateria);

      const result = await service.updateDato({
        usuarioId: mockUser.id,
        dto: mockDtoCrearMateria,
        entidad: Entidad.MATERIA,
        id: mockMateria.id,
      });


      expect(result).toEqual({
        dato: mockMateria,
        isQr: true
      });


      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner en update', async () => {

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockMateria);
      manager.save.mockResolvedValue(mockMateria);

      const result = await service.updateDato({
        id: mockMateria.id,
        usuarioId: mockUser.id,
        dto: { nombre: mockMateria.nombre },
        entidad: Entidad.MATERIA,
        qR: qr
      });

      expect(result).toEqual({
        dato: mockMateria,
        isQr: true
      });

      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores en update', async () => {

      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockMateria);
      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.updateDato({
          id: mockMateria.id,
          usuarioId: mockUser.id,
          dto: mockDtoCrearMateria,
          entidad: Entidad.MATERIA
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });
});