import { jest } from '@jest/globals';
import { Base } from '@src/base/entity/base.entity';
import { Repository } from 'typeorm';

export function createMockRepository<T extends Base>(): jest.Mocked<Repository<T>> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    target: {} as any,
  } as unknown as jest.Mocked<Repository<T>>;
}
