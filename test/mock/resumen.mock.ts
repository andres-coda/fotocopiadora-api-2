import { ClienteResumen } from "@src/cliente_resumen/entity/clienteResumen.entity";
import { mockCliente } from "./cliente.mock";
import { mockUser } from "./user.mock";
import { jest } from '@jest/globals';
import { createMockBaseService } from "./base.mock";


const resumen = new ClienteResumen();
  resumen.id = '123e4567-e89b-12d3-a456-426614174000';
  resumen.fechaCreacion = new Date('2024-01-01T00=00=00Z');
  resumen.fechaActualizacion = new Date('2024-01-02T00=00=00Z');
  resumen.deleted = false;
  resumen.pendiente = 5;
  resumen.listo = 3;
  resumen.retirado = 2;
  resumen.cliente = mockCliente;
  resumen.user = mockUser;

export const mockResumen = resumen;

export const mockResumenService = {
  ...createMockBaseService(),
  createDato: jest.fn(),
  updateDato: jest.fn(),
}