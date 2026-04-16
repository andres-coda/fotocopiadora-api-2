import { jest } from '@jest/globals';
import { mockUser } from './user.mock';
import { Base } from '@src/base/entity/base.entity';
import { BaseDto } from '@src/base/dto/baseDto';
import { CreateElementoControllerProp, DeletProp, EditarElementoControllerProp, GetDatoProp, GetIdProp, GetIdsProp, GetProp } from '@src/base/interface/base.interface';
import { EntidadDatoMapType } from '@src/gateway/dto/gatewayDto.dto';

export const mockTestEntity = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  nombre: 'Test nombre',
  user: mockUser,
}

export const createMockBaseService = <
  T extends Base,
  K extends keyof EntidadDatoMapType,
  CrearDto extends BaseDto,
  EditarDto extends BaseDto
  >() => ({
    mergeSelected: jest.fn(),
    mergeRelations: jest.fn(),
    crearCriterio: jest.fn(),

    getDato: jest.fn<(params: GetProp<T>) => Promise<T[]>>(),

    getDatoTodos: jest.fn<(params: GetProp<T>) => Promise<T[]>>(),
    getDatosByIds: jest.fn<(params: GetIdsProp<T>) => Promise<T[]>>(),

    getDatoByIdOrFail: jest.fn<(params: GetIdProp<T>) => Promise<T>>(),
    getDatoById: jest.fn<(params: GetIdProp<T>) => Promise<T | null>>(),
    getDatoByName: jest.fn<(params: GetDatoProp<T>) => Promise<T | null>>(),

    softDelete: jest.fn<(params: DeletProp<T, K>) => Promise<boolean>>(),
    undoDelete: jest.fn<(params: DeletProp<T, K>) => Promise<boolean>>(),
    delete: jest.fn<(params: DeletProp<T, K>) => Promise<boolean>>(),

    createDatoCx: jest.fn<(params: CreateElementoControllerProp<CrearDto, K>) => Promise<T>>(),

    updateElementoController: jest.fn<(params: EditarElementoControllerProp<T, EditarDto, K>) => Promise<T>>(),
  });