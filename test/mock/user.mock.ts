import { UsuarioCrear } from "@src/user/dto/userCrear.dto";
import { User } from "@src/user/entity/user.entity";

export const mockUser:User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  nombre: 'Test User', 
  password: 'password123',
  email: 'test@ej.com',
  clientes: [],
  resumenes: [],  
  especificaciones: [],
  libros: [],
  librosPedidos: [],  
  materias: [],
  pedidos: [],
  precios: [],
  propuestas: [],
  sedes: [],
  stocks: [],
  role: 'user',
} 

export const mockUsuarioCrear: UsuarioCrear = {
  nombre: mockUser.nombre,
  email: mockUser.email,
  password: mockUser.password,
};
