import { Especificacion } from "@src/especificacion/entity/especificacion.entity";
import { Especificaciones } from "@src/libro_pedido/interface/especificaciones.interface";
import { mockUser } from "./user.mock";
import { createMockBaseService } from "./base.mock";
import { jest } from '@jest/globals';
import { DtoEspecificacionCrear } from "@src/especificacion/dto/DtoCrearEspecificacion.dto";
import { DtoEspecificacionEditar } from "@src/especificacion/dto/DtoEditarEspecificacion.dto";
import { CreateProp, EditarProp } from "@src/base/interface/base.interface";
import { GetEspNombres } from "@src/especificacion/especificacion.service";

export const mockEsp: Especificacion = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fechaCreacion: new Date('2024-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2024-01-02T00:00:00Z'),
  deleted: false,
  nombre: Especificaciones.ANILLADO,
  librosPedidos: [],
  user: mockUser
};

export const mockEspService = {
  ...createMockBaseService<Especificacion, 'esp', DtoEspecificacionCrear, DtoEspecificacionEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoEspecificacionCrear, 'esp'>) => Promise<Especificacion>>(),
  updateDato: jest.fn<(params: EditarProp<Especificacion, DtoEspecificacionEditar, 'esp'>) => Promise<Especificacion>>(),
  getDatosByNombres: jest.fn<(params: GetEspNombres) => Promise<Especificacion[]>>(),
}