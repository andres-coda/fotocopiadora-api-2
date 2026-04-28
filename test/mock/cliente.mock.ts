import { Cliente } from "@src/cliente/entity/cliente.entity";
import { mockResumen } from "./resumen.mock";
import { mockUser } from "./user.mock";
import { jest } from '@jest/globals';
import { createMockBaseService } from "./base.mock";
import { DtoClienteCrear } from "@src/cliente/dto/clienteCrear.dto";
import { DtoClienteEditar } from "@src/cliente/dto/clienteEditar.dto";
import { CreateProp, EditarProp } from "@src/base/interface/base.interface";

export const mockCliente: Cliente = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  nombre: 'Test Cliente',
  telefono: '1234567890',
  email: 'cliente@ej.com',
  pedidos: [],
  resumen: mockResumen,
  user: mockUser,
}

export const mockClienteService = {
  ...createMockBaseService<Cliente, 'cliente', DtoClienteCrear, DtoClienteEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoClienteCrear, 'cliente'>) => Promise<Cliente>>(),
  updateDato: jest.fn<(params: EditarProp<Cliente, DtoClienteEditar, 'cliente'>) => Promise<Cliente>>()
}