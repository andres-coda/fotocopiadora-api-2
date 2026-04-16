import { Cliente } from "@src/cliente/entity/cliente.entity";
import { mockResumen } from "./resumen.mock";
import { mockUser } from "./user.mock";
import { jest } from '@jest/globals';

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
  getDatoByTelefono: jest.fn(),
  getDatoByEmail: jest.fn(),
  clienteExistente: jest.fn(),
  getDatoCx: jest.fn(),
  createDato: jest.fn(),
  updateDato: jest.fn(),
};