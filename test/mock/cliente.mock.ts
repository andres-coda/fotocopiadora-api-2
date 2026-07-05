import { Cliente } from "@src/cliente/entity/cliente.entity";
import { mockUser } from "./user.mock";
import { jest } from '@jest/globals';
import { createMockBaseService } from "./base.mock";
import { DtoClienteCrear } from "@src/cliente/dto/cliente.dto";
import { CreateProp, EditarProp } from "@src/base/interface/base.interface";

/* export const mockCliente: Cliente = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  nombre: 'Test Cliente',
  telefono: '1234567890',
  email: 'cliente@ej.com',
  idEmpresa: '12',
  resumen: {
    idCliente:'123e4567-e89b-12d3-a456-426614174000',
    pendiente:9,
    listo:0,
    retirado:1,
    cancelado:3
  }
}

export const mockClienteService = {
  ...createMockBaseService<Cliente, 'cliente', DtoClienteCrear, DtoClienteEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoClienteCrear, 'cliente'>) => Promise<Cliente>>(),
  updateDato: jest.fn<(params: EditarProp<Cliente, DtoClienteEditar, 'cliente'>) => Promise<Cliente>>()
} */