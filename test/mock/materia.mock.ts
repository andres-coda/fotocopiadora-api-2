import { Materia } from "@src/materia/entity/materia.entity";
import { mockUser } from "./user.mock";
import { createMockBaseService } from "./base.mock";
import { jest } from '@jest/globals';
import { CreateProp, EditarProp } from "@src/base/interface/base.interface";
import { DtoMateriaCrear } from "@src/materia/dto/materiaCrear.dto";
import { DtoMateriaEditar } from "@src/materia/dto/materiaEditar.dto";

export const mockMateria:Materia ={
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  nombre: 'Test Materia',
  user:mockUser,
  libros:[]
}

export const mockDtoCrearMateria:DtoMateriaCrear = {
  nombre: 'Test Materia'
}

export const mockMateriaService = {
  ...createMockBaseService<Materia, 'materia', DtoMateriaCrear, DtoMateriaEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoMateriaCrear, 'materia'>) => Promise<Materia>>(),
  updateDato: jest.fn<(params: EditarProp<Materia, DtoMateriaEditar, 'materia'>) => Promise<Materia>>()
}