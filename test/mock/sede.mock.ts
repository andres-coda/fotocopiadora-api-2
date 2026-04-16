import { Sede } from "@src/sede/entity/sede.entity";
import { mockUser } from "./user.mock";

export const mockSede:Sede = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  nombre: 'Sede Principal',
  libroPedidos:[],
  user:mockUser,
}