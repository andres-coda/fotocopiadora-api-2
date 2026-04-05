import { Controller } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Stock } from './entity/stock.entity';
import { DtoStockCrear } from './dto/stockCrear.dto';
import { DtoStockEditar } from './dto/stockEditar.dto';
import { StockService } from './stock.service';
import { STOCK_RELATIONS, STOCK_SELECTED } from './default/relacion';

@Controller('stock')
export class StockController extends BaseController<typeof Entidad.STOCK, Stock, DtoStockCrear, DtoStockEditar> {
  constructor(
    protected readonly stockService: StockService,
  ) {
    super(stockService, Entidad.STOCK, 'stock', [STOCK_RELATIONS], 'stock', STOCK_SELECTED)
  }
}