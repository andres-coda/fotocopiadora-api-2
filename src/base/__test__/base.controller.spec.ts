import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseController } from '../base.controller';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { createMockBaseService, mockTestEntity } from 'test/mock/base.mock';
import { mockUser } from 'test/mock/user.mock';

const mockBaseService = createMockBaseService<any, any, any, any>();

class TestController extends BaseController<any, any, any, any, any> {
  constructor(baseService: any) {
    super(baseService, 'test');
  }
}

describe('BaseController', () => {
  let controller: TestController;

  beforeEach(() => {
    controller = new TestController(mockBaseService as any);
    jest.clearAllMocks();
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll debería devolver datos', async () => {
    (mockBaseService.getDatoCx as any).mockResolvedValue({ datos: [mockTestEntity], total: 1 });
    const result = await controller.findAll(1, 20, { queryRunner: undefined } as any);
    expect(result.datos).toEqual([mockTestEntity]);
    expect(mockBaseService.getDatoCx).toHaveBeenCalled();
  });

  it('findOne debería devolver un item', async () => {
    (mockBaseService.getDatoByIdCx as any).mockResolvedValue(mockTestEntity);
    const result = await controller.findOne('1', { queryRunner: undefined } as any);
    expect(result).toEqual(mockTestEntity);
  });

  it('createDato debería retornar el elemento', async () => {
    (mockBaseService.createDatoCx as any).mockResolvedValue(mockTestEntity);
    const result = await controller.createDato({ id: 'user-1' } as any, {} as any);
    expect(result).toEqual(mockTestEntity);
  });

  it('updateDato debería retornar el elemento', async () => {
    (mockBaseService.updateElementoController as any).mockResolvedValue(mockTestEntity);
    const result = await controller.updateDato({ id: 'user-1' } as any, '1', {} as any);
    expect(result).toEqual(mockTestEntity);
  });

  it('softDeleteConstante debería hacer soft delete', async () => {
    (mockBaseService.softDelete as any).mockResolvedValue(true);
    const result = await controller.softDeleteConstante('1', { queryRunner: undefined } as any);
    expect(result).toBe(true);
  });

  it('deleteConstante debería eliminar', async () => {
    (mockBaseService.delete as any).mockResolvedValue(true);
    const result = await controller.deleteConstante('1', { queryRunner: undefined } as any);
    expect(result).toBe(true);
  });

  it('undoDeleteConstante debería deshacer', async () => {
    (mockBaseService.undoDelete as any).mockResolvedValue(true);
    const result = await controller.undoDeleteConstante('1', { queryRunner: undefined } as any);
    expect(result).toBe(true);
  });
});
