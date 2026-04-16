import { TestEntity } from "@src/base/__test__/base.service.spec";
import { mockUser } from "./user.mock";
import { BaseDto } from "@src/base/dto/baseDto";

export const mockEntity: TestEntity = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  nombre: 'Test',
  deleted: false,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date(),
  user: mockUser,
};


export const mockDtoTest: BaseDto ={}