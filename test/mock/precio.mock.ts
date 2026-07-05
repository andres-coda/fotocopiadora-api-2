import { Precio } from "@src/precio/entity/precio.entity";
import { DtoPrecioCrear, DtoPrecioEditar } from "@src/precio/dto/precio.dto";
import { createMockBaseService } from "./base.mock";
import { CreateProp, EditarProp } from "@src/base/interface/base.interface";
import { jest } from '@jest/globals';
import { PrecioEmpresa } from "@src/precio/entity/precio_empresa.entity";

export const mockPrecio: PrecioEmpresa = {
  idPrecio: '123e4567-e89b-12d3-a456-426614174000',
  idEmpresa: '12',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  detalles: 'test precio',
  importe: 10,
  precio:{
    id:'32',
    nombre:'asd'
  }
}

export const mockDtoCrearPrecio: DtoPrecioCrear = {
  nombre: 'test precio',
}

export const mockPrecioService = {
  ...createMockBaseService<Precio, 'precio', DtoPrecioCrear, DtoPrecioEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoPrecioCrear, 'precio'>) => Promise<Precio>>(),
  updateDato: jest.fn<(params: EditarProp<Precio, DtoPrecioEditar, 'precio'>) => Promise<Precio>>()
}