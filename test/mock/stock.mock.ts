import { Stock } from "@src/stock/entity/stock.entity";
import { mockLibro } from "./libro.mock";
import { mockUser } from "./user.mock";
import { jest } from '@jest/globals';
import { createMockBaseService } from "./base.mock";
import { DtoStockCrear } from "@src/stock/dto/stockCrear.dto";
import { DtoStockEditar } from "@src/stock/dto/stockEditar.dto";
import { CreateProp, EditarProp, UpdateRetorno } from "@src/base/interface/base.interface";
import { Estado } from "@src/interface/estado.interface";

const stock = new Stock();

  stock.id = '123e4567-e89b-12d3-a456-426614174000',
  stock.fechaCreacion = new Date('2024-01-01T00=00=00Z'),
  stock.fechaActualizacion = new Date('2024-01-02T00=00=00Z'),
  stock.deleted = false,
  stock.stock = 2,
  stock.pendiente = 5,
  stock.listo = 3,
  stock.retirado = 2,
  stock.cancelado = 0,
  stock.libro = mockLibro,
  stock.user = mockUser

  export const mockStock:Stock = stock;

  export const mockStockService = {
  ...createMockBaseService<Stock, 'stock', DtoStockCrear, DtoStockEditar>(),
  createDato: jest.fn<(params: CreateProp<DtoStockCrear, 'stock'>) => Promise<Stock>>(),
  updateDato: jest.fn<(params: EditarProp<Stock, DtoStockEditar, 'stock'>) => Promise<UpdateRetorno<Stock>>>()
}

export const mockDtoStockCrear: DtoStockCrear = {
  stock:1
}

export const mockDtoStockEditar: DtoStockEditar = {
  actual: Estado.STOCK,
  cantidad: 1
}