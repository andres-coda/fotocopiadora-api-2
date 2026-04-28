import { Pedido } from "@src/pedido/entity/pedido.entity";
import { mockCliente } from "./cliente.mock";
import { mockUser } from "./user.mock";
import { createMockBaseService } from "./base.mock";
import { DtoPedidoCrear } from "@src/pedido/dto/pedidoCrear.dto";
import { DtoPedidoEditar } from "@src/pedido/dto/pedidoEditar.dto";
import { jest } from '@jest/globals';
import { CreateProp, EditarProp } from "@src/base/interface/base.interface";
import { mockDtoLibroPedidoCrear } from "./libro_pedido.mock";

export const mockPedido:Pedido = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  fechaEntrega: new Date('2024-01-10T00:00:00Z').toString(),
  importeTotal:10000,
  archivos:2,
  anillados:1,
  sena:5000,
  cliente:mockCliente,
  libroPedidos: [],
  user:mockUser
}

export const mockDtoPedidoCrear:DtoPedidoCrear = {
  fechaEntrega: new Date('2024-01-10T00:00:00Z').toString(),
  importeTotal:10000,
  anillados:1,
  sena:5000,
  archivos:2,
  cliente: mockCliente.id,
  librosPedidos: [mockDtoLibroPedidoCrear]
}

export const mockDtoPedidoEditar:DtoPedidoEditar = {
  sena:6000,
  librosPedidos: [mockDtoLibroPedidoCrear]
}

export const mockPedidoService = {
  ...createMockBaseService<Pedido, 'pedido', DtoPedidoCrear, DtoPedidoEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoPedidoCrear, 'pedido'>) => Promise<Pedido>>(),
  updateDato: jest.fn<(params: EditarProp<Pedido, DtoPedidoEditar, 'pedido'>) => Promise<Pedido>>()
}