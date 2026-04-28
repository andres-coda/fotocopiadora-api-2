import { Propuesta } from "@src/propuesta_pedido/entity/propuesta_pedido.entity";
import { mockUser } from "./user.mock";
import { DtoPropuestaCrear } from "@src/propuesta_pedido/dto/propuesta_pedidoCrear.dto";
import { mockLibro } from "./libro.mock";
import { jest } from '@jest/globals';
import { createMockBaseService } from "./base.mock";
import { CreateProp, EditarProp } from "@src/base/interface/base.interface";
import { DtoPropuestaEditar } from "@src/propuesta_pedido/dto/propuesta_pedidoEditar.dto";

export const mockPropuesta:Propuesta = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'), 
  deleted: false,
  nombre: 'Propuesta de prueba',
  libro:[],
  user:mockUser,
}

export const mockDtoCrearPropuesta:DtoPropuestaCrear = {
  libros: [mockLibro.id],
  nombre: 'Propuesta de prueba',
}

export const mockPropuestaService = {
  ...createMockBaseService<Propuesta, 'propuesta_pedido', DtoPropuestaCrear, DtoPropuestaEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoPropuestaCrear, 'propuesta_pedido'>) => Promise<Propuesta>>(),
  updateDato: jest.fn<(params: EditarProp<Propuesta, DtoPropuestaEditar, 'propuesta_pedido'>) => Promise<Propuesta>>()
}