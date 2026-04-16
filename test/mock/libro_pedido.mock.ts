import { LibroPedido } from "@src/libro_pedido/entity/libroPedido.entity";
import { mockLibro } from "./libro.mock";
import { mockUser } from "./user.mock";
import { mockSede } from "./sede.mock";
import { mockPedido } from "./pedido.mock";
import { Estado } from "@src/interface/estado.interface";

export const mockLibroPedido:LibroPedido={  
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  cantidad: 1,
  detalles: 'Detalles del libro pedido',
  estado: Estado.PENDIENTE,
  libro:mockLibro,
  sede: mockSede,
  pedido:mockPedido,
  especificaciones:[],
  user: mockUser
}