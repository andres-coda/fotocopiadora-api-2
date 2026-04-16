import { Pedido } from "@src/pedido/entity/pedido.entity";
import { mockCliente } from "./cliente.mock";
import { mockUser } from "./user.mock";

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