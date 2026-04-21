import { Libro } from "@src/libro/entity/libro.entity";
import { mockMateria } from "./materia.mock";
import { mockStock } from "./stock.mock";
import { mockUser } from "./user.mock";
import { Especificaciones } from "@src/libro_pedido/interface/especificaciones.interface";
import { DtoLibroCrear } from "@src/libro/dto/libroCrear.dto";
import { createMockBaseService } from "./base.mock";
import { DtoLibroEditar } from "@src/libro/dto/libroEditar.dto";
import { CreateProp, EditarProp } from "@src/base/interface/base.interface";
import { jest } from '@jest/globals';

export const mockLibro:Libro={
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  nombre: 'Test Libro',
  editorial: 'Test Editorial',
  cantidadPg: 100,
  edicion: 1,
  nivel: 'Elementary',
  anio: '2024',
  adhesivo:2,
  autor: 'Test Autor',
  img: 'https://example.com/test-libro.jpg',
  especificacionesDefecto: [Especificaciones.ABROCHADO],
  materia:mockMateria,
  stock:mockStock,
  libroPedidos:[],
  propuesta:[],
  user:mockUser,
  componentes:[],
}

export const mockDtoCrearLibro:DtoLibroCrear = {
  nombre: 'Test Libro',
  editorial: 'Test Editorial',
  cantidadPg: 100,
  edicion: 1,
  nivel: 'Elementary',
  anio: '2024',
  adhesivos:2,
  autor: 'Test Autor',
  img: 'https://example.com/test-libro.jpg',
  especificacionesDefecto: [Especificaciones.ABROCHADO],
  materia: mockLibro.nombre,
}

export const mockLibroService = {
  ...createMockBaseService<Libro, 'libro', DtoLibroCrear, DtoLibroEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoLibroCrear, 'libro'>) => Promise<Libro>>(),
  updateDato: jest.fn<(params: EditarProp<Libro, DtoLibroEditar, 'libro'>) => Promise<Libro>>()
}