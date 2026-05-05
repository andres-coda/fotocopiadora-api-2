import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Stock } from './entity/stock.entity';
import { DtoStockCrear } from './dto/stockCrear.dto';
import { DtoStockEditar } from './dto/stockEditar.dto';

@Injectable()
export class StockService extends BaseService<typeof Entidad.STOCK, Stock, DtoStockCrear, DtoStockEditar> {
  constructor(
    @InjectRepository(Stock) private readonly stockRepository: Repository<Stock>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(stockRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ usuario, qR, dto, entidad }: CreateProp<DtoStockCrear, typeof Entidad.STOCK>): Promise<Stock> {
    try {
      const stock: Stock = new Stock();
      stock.stock = dto.stock || 0;
      stock.user = usuario;

      const newStock: Stock = qR
        ? await qR.manager.save(Stock, stock)
        : await this.stockRepository.save(stock);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad,
          dato: newStock
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return newStock;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el stock`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Stock, DtoStockEditar,typeof Entidad.STOCK>): Promise<UpdateRetorno<Stock>> {
    try {
      const stockExistente: Stock = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        relaciones,
        selected,
        entidadError
      });

      const stock:Stock = stockExistente.verificarStock(dto);

      console.log('Stock : ', stock)

      const newStock: Stock = qR
        ? await qR.manager.save(Stock, stock)
        : await this.stockRepository.save(stock);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad,
          dato:newStock
        }

        this.gatewayGateway.actualizacionDato(payload);
      }
      return {dato:newStock, isQr:true};

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${ id} en el registro de stocks`)
    }
  }
}
