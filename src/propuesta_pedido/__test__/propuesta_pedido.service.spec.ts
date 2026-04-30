import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockDataSource, createMockQueryRunner } from 'test/mock/qR.mock';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockGateway } from 'test/mock/gateway.mocks';
import { mockUser } from 'test/mock/user.mock';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Propuesta } from '../entity/propuesta_pedido.entity';
import { PropuestaService } from '../propuesta_pedido.service';
import { LibroService } from '@src/libro/libro.service';
import { mockLibro, mockLibroService } from 'test/mock/libro.mock';
import { mockDtoCrearPropuesta, mockPropuesta } from 'test/mock/propuesta.mock';
import { mockErrores } from 'test/mock/error.mocks';


jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

jest.mock('@src/libro/entity/libro.entity', () => ({
  Libro: class { },
}));

const mockRepo = createMockRepository<Propuesta>();
let qr: jest.Mocked<QueryRunner>;
let manager: jest.Mocked<EntityManager>;


describe('PropuestaService', () => {
  let service: PropuestaService;
  let repo: Repository<Propuesta>;
  let erroresService: ErroresService;
  let gateway: GatewayGateway;
  let libroService: LibroService;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Propuesta>();
    qr = qrMock.qr;
    manager = qrMock.manager;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropuestaService,
        {
          provide: getRepositoryToken(Propuesta),
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
        }, {
          provide: LibroService,
          useValue: mockLibroService,
        }
      ],
    }).compile();


    service = module.get<PropuestaService>(PropuestaService);
    repo = module.get(getRepositoryToken(Propuesta));
    erroresService = module.get(ErroresService);
    gateway = module.get(GatewayGateway);
    libroService = module.get(LibroService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  // ---------------- CREATE ----------------

  describe('createDato', () => {
    it('✔️ debería crear una propuesta correctamente', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      jest.spyOn(libroService, 'getDatosByIds').mockResolvedValue([mockLibro]);
      mockRepo.save.mockResolvedValue(mockPropuesta);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearPropuesta,
        entidad: Entidad.PROPUESTA_PEDIDO,
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toEqual(mockPropuesta);
    });

    /* it('❌ debería lanzar error si el nombre existe', async () => {
      Object.defineProperty(service, 'getDatoByName', {
        value: jest.fn().mockResolvedValue(mockPropuesta as unknown as never),
        writable: true,
        configurable: true,
      });
      await expect(
        service.createDato({
          usuario: mockUser,
          dto: mockDtoCrearPropuesta,
          entidad: Entidad.PROPUESTA_PEDIDO,
        })
      ).rejects.toThrow(NotFoundException);

      expect(mockRepo.save).not.toHaveBeenCalled();
    });
 */
    it('🔁 debería usar QueryRunner si existe', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      jest.spyOn(libroService, 'getDatosByIds').mockResolvedValue([mockLibro]);
      manager.save.mockResolvedValue(mockPropuesta);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearPropuesta,
        entidad: Entidad.PROPUESTA_PEDIDO,
        qR: qr
      });

      expect(result).toEqual(mockPropuesta);
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
          dto: mockDtoCrearPropuesta,
          entidad: Entidad.PROPUESTA_PEDIDO,
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
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockPropuesta);

      mockRepo.save.mockResolvedValue(mockPropuesta);

      const result = await service.updateDato({
        usuarioId: mockUser.id,
        dto: mockDtoCrearPropuesta,
        entidad: Entidad.PROPUESTA_PEDIDO,
        id: mockPropuesta.id,
      });


      expect(result).toEqual({
        dato: mockPropuesta,
        isQr: true
      });


      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner en update', async () => {

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockPropuesta);
      manager.save.mockResolvedValue(mockPropuesta);

      const result = await service.updateDato({
        id: mockPropuesta.id,
        usuarioId: mockUser.id,
        dto: mockDtoCrearPropuesta,
        entidad: Entidad.PROPUESTA_PEDIDO,
        qR: qr
      });

      expect(result).toEqual({
        dato: mockPropuesta,
        isQr: true
      });

      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores en update', async () => {

      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockPropuesta);
      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.updateDato({
          id: mockPropuesta.id,
          usuarioId: mockUser.id,
          dto: mockDtoCrearPropuesta,
          entidad: Entidad.PROPUESTA_PEDIDO
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });
});