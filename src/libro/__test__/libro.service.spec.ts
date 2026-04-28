import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createMockRepository } from 'test/mock/repo.mocks';
import { Libro } from '../entity/libro.entity';
import { createMockDataSource, createMockQueryRunner, mockDataSource } from 'test/mock/qR.mock';
import { LibroService } from '../libro.service';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { MateriaService } from '@src/materia/materia.service';
import { StockService } from '@src/stock/stock.service';
import { ComponenteService } from '@src/componente/componente.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { mockGateway } from 'test/mock/gateway.mocks';
import { mockMateria, mockMateriaService } from 'test/mock/materia.mock';
import { mockDtoStockCrear, mockDtoStockEditar, mockStock, mockStockService } from 'test/mock/stock.mock';
import { mockComponente, mockComponenteService } from 'test/mock/componente.mock';
import { mockUser } from 'test/mock/user.mock';
import { mockDtoCrearLibro, mockLibro } from 'test/mock/libro.mock';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { DtoLibroEditar } from '../dto/libroEditar.dto';

jest.mock('@src/materia/entity/materia.entity', () => ({
  Materia: class { },
}));

jest.mock('@src/stock/entity/stock.entity', () => ({
  Stock: class { },
}));

jest.mock('@src/propuesta_pedido/entity/propuesta_pedido.entity', () => ({
  Propuesta: class { },
}));

jest.mock('@src/componente/entity/componente.entity', () => ({
  Componente: class { },
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

const mockRepo = createMockRepository<Libro>();
let qr: jest.Mocked<QueryRunner>;
let manager: jest.Mocked<EntityManager>;


describe('LibroService', () => {
  let service: LibroService;
  let repo: Repository<Libro>;
  let erroresService: ErroresService;
  let gateway: GatewayGateway;
  let materiaService: MateriaService;
  let stockService: StockService;
  let componenteService: ComponenteService;

  beforeEach(async () => {
    const qrMock = createMockQueryRunner<Libro>();
    qr = qrMock.qr;
    manager = qrMock.manager;
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LibroService,
        {
          provide: getRepositoryToken(Libro),
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
          provide: MateriaService,
          useValue: mockMateriaService,
        },
        {
          provide: StockService,
          useValue: mockStockService,
        },
        {
          provide: ComponenteService,
          useValue: mockComponenteService,
        },
      ],
    }).compile();


    service = module.get<LibroService>(LibroService);
    repo = module.get(getRepositoryToken(Libro));
    erroresService = module.get(ErroresService);
    gateway = module.get(GatewayGateway);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  // ---------------- CREATE ----------------

  describe('createDato', () => {
    it('✔️ debería crear un libro correctamente', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);

      mockComponenteService.getDatosByNombres.mockResolvedValue([mockComponente]);
      mockMateriaService.createDato.mockResolvedValue(mockMateria);
      mockStockService.createDato.mockResolvedValue(mockStock);
      mockRepo.save.mockResolvedValue(mockLibro);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearLibro,
        entidad: Entidad.LIBRO,
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
      expect(result).toEqual(mockLibro);
    });

    it('✔️ debería devolver libro existente', async () => {
      const existente = mockLibro;

      jest.spyOn(service, 'getDatoByName').mockResolvedValue(existente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearLibro,
        entidad: Entidad.LIBRO,
      });

      expect(result).toBe(existente);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner si existe', async () => {
      jest.spyOn(service, 'getDatoByName').mockResolvedValue(null);
      manager.save.mockResolvedValue(mockLibro);

      const result = await service.createDato({
        usuario: mockUser,
        dto: mockDtoCrearLibro,
        entidad: Entidad.LIBRO,
        qR: qr
      });

      expect(result).toEqual(mockLibro);
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
          dto: mockDtoCrearLibro,
          entidad: Entidad.LIBRO,
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
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockLibro);

      mockRepo.save.mockResolvedValue(mockLibro);

      const result = await service.updateDato({
        usuarioId: mockUser.id,
        dto: { nombre: mockLibro.nombre },
        entidad: Entidad.LIBRO,
        id: mockLibro.id,
      });


      expect(result).toEqual({
        dato: mockLibro,
        isQr: true
      });


      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });

    it('🔁 debería usar QueryRunner en update', async () => {

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockLibro);
      manager.save.mockResolvedValue(mockLibro);

      const result = await service.updateDato({
        id: mockLibro.id,
        usuarioId: mockUser.id,
        dto: { nombre: mockLibro.nombre },
        entidad: Entidad.LIBRO,
        qR: qr
      });

      expect(result).toEqual({
        dato: mockLibro,
        isQr: true
      });

      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('❌ debería manejar errores en update', async () => {

      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(mockLibro);
      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });


      const dto: DtoLibroEditar = { nombre: mockLibro.nombre };

      await expect(
        service.updateDato({
          id: mockLibro.id,
          usuarioId: mockUser.id,
          dto,
          entidad: Entidad.LIBRO
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });
  });

  // ---------------- STOCK ----------------
  describe('agregarStock', () => {

    it('✅ debería agregar stock correctamente', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue({
        ...mockLibro,
        stock: mockStock
      });

      mockStockService.updateDato.mockResolvedValue({ dato: mockStock, isQr: true });

      const result = await service.agregarStock({
        id: mockLibro.id,
        usuarioId: mockUser.id,
        dto: { stock: 10 },
        entidadError: 'libro',
        entidad: Entidad.STOCK
      });

      expect(service.getDatoByIdOrFail).toHaveBeenCalled();
      expect(mockStockService.updateDato).toHaveBeenCalledWith(
        expect.objectContaining({
          dto: {
            anterior: expect.anything(),
            actual: expect.anything(),
            cantidad: 10
          }
        })
      );

      expect(result).toEqual(mockStock);
    });

    it('❌ debería manejar errores con erroresService', async () => {
      const error = new Error('fail');
      const handled = new Error('handled');

      jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(error);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handled });

      await expect(
        service.agregarStock({
          id: 1,
          usuarioId: 1,
          dto: { stock: 10 },
          entidadError: 'libro',
          entidad: Entidad.STOCK
        } as any)
      ).rejects.toThrow(handled);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });

  });

  describe('agregarStockCx', () => {

    it('✅ debería hacer commit y devolver true', async () => {
      jest.spyOn(service, 'agregarStock').mockResolvedValue(mockStock);

      const result = await service.agregarStockCx({
        id: mockStock.id,
        usuarioId: mockUser.id,
        dto: { stock: 10 },
        entidadError: 'stock',
        entidad: Entidad.STOCK,
        qR: qr
      });

      expect(result).toBe(true);
      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(qr.rollbackTransaction).not.toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
    });

    it('❌ debería hacer rollback si falla', async () => {
      const error = new Error('fail');
      const handled = new Error('handled');

      jest.spyOn(service, 'agregarStock').mockRejectedValue(error);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handled });

      await expect(
        service.agregarStockCx({
          id: mockStock.id,
          usuarioId: mockUser.id,
          dto: { stock: 10 },
          entidadError: 'stock',
          entidad: Entidad.STOCK,
          qR: qr
        })
      ).rejects.toThrow(handled);

      expect(qr.rollbackTransaction).toHaveBeenCalled();
      expect(qr.commitTransaction).not.toHaveBeenCalled();
    });

    it('🧹 siempre debería liberar el QueryRunner', async () => {
      jest.spyOn(service, 'agregarStock').mockResolvedValue(mockStock);

      await service.agregarStockCx({
        id: mockStock.id,
        usuarioId: mockUser.id,
        dto: { stock: 10 },
        entidadError: 'stock',
        entidad: Entidad.STOCK,
        qR: qr
      });

      expect(qr.release).toHaveBeenCalled();
    });

  });

  describe('quitarStockCx', () => {

    it('✅ debería convertir stock a negativo y hacer commit', async () => {
      const spy = jest.spyOn(service, 'agregarStock').mockResolvedValue(mockStock);

      const result = await service.quitarStockCx({
        id: mockStock.id,
        usuarioId: mockUser.id,
        dto: { stock: 10 },
        entidadError: 'stock',
        entidad: Entidad.STOCK,
        qR: qr
      });

      expect(result).toBe(true);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          dto: { stock: -10 }
        })
      );

      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(gateway.actualizacionDato).toHaveBeenCalled();
    });

    it('❌ debería hacer rollback si falla', async () => {
      const error = new Error('fail');
      const handled = new Error('handled');

      jest.spyOn(service, 'agregarStock').mockRejectedValue(error);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handled });

      await expect(
        service.quitarStockCx({
          id: mockStock.id,
          usuarioId: mockUser.id,
          dto: { stock: 10 },
          entidadError: 'stock',
          entidad: Entidad.STOCK,
          qR: qr
        })
      ).rejects.toThrow(handled);

      expect(qr.rollbackTransaction).toHaveBeenCalled();
    });

  });
});