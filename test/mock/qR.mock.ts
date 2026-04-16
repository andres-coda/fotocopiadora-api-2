import { QueryRunner, FindManyOptions, FindOneOptions, EntityTarget, DeleteResult, EntityManager } from 'typeorm';
import { jest } from '@jest/globals';
import { DeepPartial } from 'typeorm/browser';

type MockManager<T> = {
  find: jest.MockedFunction<
    (entity: EntityTarget<T>, options?: FindManyOptions<T>) => Promise<T[]>
  >;

  findOne: jest.MockedFunction<
    (entity: EntityTarget<T>, options: FindOneOptions<T>) => Promise<T | null>
  >;

  save: jest.MockedFunction<
    (entity: DeepPartial<T>) => Promise<T>
  >;

  remove: jest.MockedFunction<
    (entity: EntityTarget<T>, criteria: unknown) => Promise<DeleteResult>
  >;
};

export function createMockQueryRunner<T>() {
  const manager: jest.Mocked<EntityManager> = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  } as any;

  const qr: QueryRunner = {
    manager,
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  } as unknown as QueryRunner;

  return { qr, manager };
}


export const mockDataSource = {
  createQueryRunner: jest.fn(() => ({
    manager: {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    },
  })),
};