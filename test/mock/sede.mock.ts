import { Sede } from "@src/sede/entity/sede.entity";
import { mockUser } from "./user.mock";
import { createMockBaseService } from "./base.mock";
import { DtoSedeCrear } from "@src/sede/dto/sedeCrear.dto";
import { DtoSedeEditar } from "@src/sede/dto/sedeEditar.dto";
import { jest } from '@jest/globals';
import { CreateProp, EditarProp } from "@src/base/interface/base.interface";

export const mockSede:Sede = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  nombre: 'Sede Principal',
  libroPedidos:[],
  user:mockUser,
}

export const mockDtoCrearSede: DtoSedeCrear = {
  nombre: 'Sede Principal',
}

export const mockSedeService = {
  ...createMockBaseService<Sede, 'sede', DtoSedeCrear, DtoSedeEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoSedeCrear, 'sede'>) => Promise<Sede>>(),
  updateDato: jest.fn<(params: EditarProp<Sede, DtoSedeEditar, 'sede'>) => Promise<Sede>>(),
}