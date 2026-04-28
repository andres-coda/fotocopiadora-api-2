import { Precio } from "@src/precio/entity/precio.entity";
import { mockUser } from "./user.mock";
import { DtoPrecioCrear } from "@src/precio/dto/precioCrear.dto";
import { createMockBaseService } from "./base.mock";
import { DtoPrecioEditar } from "@src/precio/dto/precioEditar.dto";
import { CreateProp, EditarProp } from "@src/base/interface/base.interface";
import { jest } from '@jest/globals';

export const mockPrecio: Precio = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  tipo: 'test precio',
  importe: 10,
  user: mockUser,
}

export const mockDtoCrearPrecio: DtoPrecioCrear = {
  tipo: 'test precio',
  importe: 10,
}

export const mockPrecioService = {
  ...createMockBaseService<Precio, 'precio', DtoPrecioCrear, DtoPrecioEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoPrecioCrear, 'precio'>) => Promise<Precio>>(),
  updateDato: jest.fn<(params: EditarProp<Precio, DtoPrecioEditar, 'precio'>) => Promise<Precio>>()
}