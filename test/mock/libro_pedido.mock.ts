import { LibroPedido } from "@src/libro_pedido/entity/libroPedido.entity";
import { mockLibro } from "./libro.mock";
import { mockUser } from "./user.mock";
import { mockSede } from "./sede.mock";
import { mockPedido } from "./pedido.mock";
import { Estado } from "@src/interface/estado.interface";
import { createMockBaseService } from "./base.mock";
import { DtoLibroPedidoCrear } from "@src/libro_pedido/dto/DtoCrearLibroPedido.dto";
import { DtoLibroPedidoEditar } from "@src/libro_pedido/dto/DtoEditarLibroPedido.dto";
import { CreateProp, EditarElementoControllerProp, EditarProp, GetIdProp } from "@src/base/interface/base.interface";
import { jest } from '@jest/globals';
import { DtoCambiarEstado } from "@src/libro_pedido/dto/DtoCambiarEstado.dto";

export const mockLibroPedido: LibroPedido = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  cantidad: 1,
  detalles: 'Detalles del libro pedido',
  estado: Estado.PENDIENTE,
  libro: mockLibro,
  sede: mockSede,
  pedido: mockPedido,
  especificaciones: [],
  user: mockUser
}

export const mockDtoLibroPedidoCrear:DtoLibroPedidoCrear = {
  pedido_id:'123e4567-e89b-12d3-a456-426614174000',
  cantidad: 1,
  libro_id: mockLibro.id,
  sede_id: mockSede.id
}

export const mockLibroPedidoService = {
  ...createMockBaseService<LibroPedido, 'libro_pedido', DtoLibroPedidoCrear, DtoLibroPedidoEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoLibroPedidoCrear, 'libro_pedido'>) => Promise<LibroPedido>>(),
  updateDato: jest.fn<(params: EditarProp<LibroPedido, DtoLibroPedidoEditar, 'libro_pedido'>) => Promise<LibroPedido>>(),
  cambiarEstadoCx: jest.fn<(params: EditarElementoControllerProp<LibroPedido, DtoCambiarEstado, 'libro_pedido'>) => Promise<LibroPedido>>(),
};