import { Componente } from "@src/componente/entity/componente.entity";
import { createMockBaseService } from "./base.mock";
import { jest } from '@jest/globals';
import { mockUser } from "./user.mock";
import { DtoComponenteCrear } from "@src/componente/dto/componenteCrear.dto";
import { DtoComponenteEditar } from "@src/componente/dto/componenteEditar.dto";
import { CreateProp, EditarProp } from "@src/base/interface/base.interface";

export const mockComponente:Componente ={
  id: '123e4567-e89b-12d3-a456-426514174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  nombre: 'Test Componente',
  user:mockUser,
  libros:[]
}

export const mockDtoCrearComponente: DtoComponenteCrear = {
  nombre: 'Test Componente',
}

export const mockComponenteService = {
  ...createMockBaseService<Componente, 'componente', DtoComponenteCrear, DtoComponenteEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoComponenteCrear, 'componente'>) => Promise<Componente>>(),
  updateDato: jest.fn<(params: EditarProp<Componente, DtoComponenteEditar, 'componente'>) => Promise<Componente>>()
}