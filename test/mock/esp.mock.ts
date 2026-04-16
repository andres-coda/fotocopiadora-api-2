import { Especificacion } from "@src/especificacion/entity/especificacion.entity";
import { Especificaciones } from "@src/libro_pedido/interface/especificaciones.interface";
import { mockUser } from "./user.mock";

export const mockEsp:Especificacion = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'), 
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  nombre: Especificaciones.ANILLADO,
  librosPedidos: [],
  user:mockUser
};