import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, FindOneOptions, QueryRunner, Repository } from "typeorm";
import { Stock } from "./entity/stock.entity";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { ErroresService } from "@src/error/error.service";
import { GatewayGateway } from "@src/gateway/gateway.gateway";
import { DtoStockActualizar } from "./dto/stock.dto";

interface GetStockByIdProp{
  qR:QueryRunner;
  id:string;
}

interface ActualizarStockProp extends GetStockByIdProp{
  dto:DtoStockActualizar;
}
@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock) private readonly libroRepository: Repository<Stock>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) { }

  async getStockByIdOrdFail({id, qR}:GetStockByIdProp):Promise<Stock>{
    try{
      const criterio: FindOneOptions = { where:{ id: id}}
      const stock = await qR.manager.findOne(Stock,criterio);

      if (!stock) throw new NotFoundException(`El stock de libro id ${id} no fue encontrado`);

      return stock;
    } catch(er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer el stock del libro id ${id}`);
    }
  }

  async actualizarStok({id, qR, dto}:ActualizarStockProp):Promise<Stock>{
    try{
      const stock:Stock = await this.getStockByIdOrdFail({id, qR});
      stock.stock = dto.stock;

      const newStock = await qR.manager.save(Stock, stock);

      if(!newStock) throw new NotFoundException(`No se pudo actualizar el stock del libro id ${id}`);

      return newStock;
    } catch(er) {
      this.erroresService.handleExceptions(er, `Error al intentar actualizar el stock del libro id ${id}`);
    }
  }
}