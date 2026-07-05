import { Libro } from "@src/libro/entity/libro.entity";
import { Especificaciones } from "@src/pedido_item/interface/especificaciones.interface";
import { DtoLibroCrear } from "@src/libro/dto/libroCrear.dto";
import { BuscarLibroProp } from "@src/libro/libro.service";
import { DtoLibroRespuesta } from "@src/libro/dto/libroRetorno.dto";
import { jest } from '@jest/globals';

export const mockLibro:Libro={
  idLibro: '123e4567-e89b-12d3-a456-426614174000',
  deleted: false,
  cantidadPg: 100,
  adhesivo:2,
  especificacionesDefecto: [Especificaciones.ABROCHADO],
  pedidoItems:[],
  propuesta:[],
  idEmpresa:'12'
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
  materia: '132'
}

export const mockLibroService = {
  buscarLibro:jest.fn<(params:BuscarLibroProp)=>Promise<DtoLibroRespuesta[]>>()
  }