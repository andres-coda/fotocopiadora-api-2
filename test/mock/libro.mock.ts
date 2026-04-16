import { Libro } from "@src/libro/entity/libro.entity";
import { mockMateria } from "./materia.mock";
import { mockStock } from "./stock.mock";
import { mockUser } from "./user.mock";

export const mockLibro:Libro={
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  nombre: 'Test Libro',
  editorial: 'Test Editorial',
  cantidadPg: 100,
  anio: '2024',
  adhesivo:2,
  autor: 'Test Autor',
  img: 'https://example.com/test-libro.jpg',
  materia:mockMateria,
  stock:mockStock,
  libroPedidos:[],
  propuesta:[],
  user:mockUser
}