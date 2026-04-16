
import { createMockBaseService, mockTestEntity } from "test/mock/base.mock";
import { BaseController } from "../base.controller";
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestEntity } from "./base.service.spec";
import { BaseDto } from "../dto/baseDto";
import { mockEntity } from "test/mock/test.mock";

class TestController extends BaseController<any, any, any, any> {
  constructor(baseService: any) {
    super(baseService, 'test');
  }
}

const mockBaseService = createMockBaseService<TestEntity, 'testEntity', BaseDto,BaseDto>();

describe('BaseController', () => {
  let controller: TestController;

  const mockUserParcial = { sub: 'user-1' };
  const mockUserCompleto = { id: 'user-1' };

  beforeEach(() => {
    controller = new TestController(mockBaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {

    it('debería devolver datos (camino feliz)', async () => {
      mockBaseService.getDato.mockResolvedValue([mockEntity]);

      const result = await controller.findAll(mockUserParcial as any);

      expect(result).toEqual([mockEntity]);
      expect(mockBaseService.getDato).toHaveBeenCalledWith(
        expect.objectContaining({
          usuarioId: mockUserParcial.sub,
        })
      );
    });

    it('debería manejar error', async () => {
      const error = new Error('fail');

      mockBaseService.getDato.mockRejectedValue(error);

      await expect(
        controller.findAll(mockUserParcial as any)
      ).rejects.toThrow(error);
    });

  });

  describe('findOne', () => {

    it('debería devolver item (camino feliz)', async () => {
      mockBaseService.getDatoByIdOrFail.mockResolvedValue(mockEntity);

      const result = await controller.findOne('1', mockUserParcial as any);

      expect(result).toEqual(mockEntity);
      expect(mockBaseService.getDatoByIdOrFail).toHaveBeenCalled();
    });

    it('debería manejar error', async () => {
      const error = new Error('not found');

      mockBaseService.getDatoByIdOrFail.mockRejectedValue(error);

      await expect(
        controller.findOne('1', mockUserParcial as any)
      ).rejects.toThrow(error);
    });

  });
  describe('undoDeleteConstante', () => {

    it('debería devolver true (camino feliz)', async () => {
      mockBaseService.undoDelete.mockResolvedValue(true);

      const result = await controller.undoDeleteConstante(
        mockUserParcial as any,
        '1'
      );

      expect(result).toBe(true);
      expect(mockBaseService.undoDelete).toHaveBeenCalled();
    });

    it('debería manejar error', async () => {
      const error = new Error('fail');

      mockBaseService.undoDelete.mockRejectedValue(error);

      await expect(
        controller.undoDeleteConstante(mockUserParcial as any, '1')
      ).rejects.toThrow(error);
    });

  });
  describe('deleteConstante', () => {

    it('debería eliminar (camino feliz)', async () => {
      mockBaseService.delete.mockResolvedValue(true);

      const result = await controller.deleteConstante(
        mockUserParcial as any,
        '1'
      );

      expect(result).toBe(true);
    });

    it('debería manejar error', async () => {
      const error = new Error('fail');

      mockBaseService.delete.mockRejectedValue(error);

      await expect(
        controller.deleteConstante(mockUserParcial as any, '1')
      ).rejects.toThrow(error);
    });

  });
  describe('softDeleteConstante', () => {

    it('debería hacer soft delete (camino feliz)', async () => {
      mockBaseService.softDelete.mockResolvedValue(true);

      const result = await controller.softDeleteConstante(
        mockUserParcial as any,
        '1'
      );

      expect(result).toBe(true);
    });

    it('debería manejar error', async () => {
      const error = new Error('fail');

      mockBaseService.softDelete.mockRejectedValue(error);

      await expect(
        controller.softDeleteConstante(mockUserParcial as any, '1')
      ).rejects.toThrow(error);
    });

  });
  describe('createDato', () => {


    it('debería retornar el elemento que llega', async () => {
      mockBaseService.createDatoCx.mockResolvedValue(mockEntity);

      const result = await controller.createDato(
        mockUserCompleto as any,
        {}
      );

      expect(result).toEqual(mockEntity);
    });


    it('debería manejar error', async () => {
      const error = new Error('fail');

      mockBaseService.createDatoCx.mockRejectedValue(error);

      await expect(
        controller.createDato(mockUserCompleto as any, {})
      ).rejects.toThrow(error);
    });

  });
  describe('updateDato', () => {


    it('debería retornar el elemento deseado (camino feliz)', async () => {
      mockBaseService.updateElementoController.mockResolvedValue(mockEntity);

      const result = await controller.updateDato(
        mockUserCompleto as any,
        '1',
        {}
      );

      expect(result).toBe(mockEntity);
    });

    
    it('debería manejar error', async () => {
      const error = new Error('fail');

      mockBaseService.updateElementoController.mockRejectedValue(error);

      await expect(
        controller.updateDato(mockUserCompleto as any, '1', {})
      ).rejects.toThrow(error);
    });

  });
});