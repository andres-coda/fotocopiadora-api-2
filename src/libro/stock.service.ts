import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, FindOneOptions, QueryRunner, Repository } from "typeorm";
import { Stock } from "./entity/stock.entity";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { ErroresService } from "@src/error/error.service";
import { GatewayGateway } from "@src/gateway/gateway.gateway";
import { DtoStockActualizar } from "./dto/stock.dto";
import { StockRetorno } from "./retorno/stock.retorno";

interface GetStockByIdProp{
  qR:QueryRunner;
  id:string;
  idEmpresa: string;
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

  async getStockByIdOrdFail({id, qR, idEmpresa}:GetStockByIdProp):Promise<Stock>{
    try{
      const criterio: FindOneOptions<Stock> = { 
        where:{ 
          idLibro: id,
          idEmpresa: idEmpresa
        }
      }
      const stock = await qR.manager.findOne(Stock,criterio);

      if (!stock) throw new NotFoundException(`El stock de libro id ${id} no fue encontrado`);

      return stock;
    } catch(er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer el stock del libro id ${id}`);
    }
  }

  async actualizarStok({id, qR, dto, idEmpresa}:ActualizarStockProp):Promise<StockRetorno>{
    try{
      const stock:Stock = await this.getStockByIdOrdFail({id, qR, idEmpresa});
      stock.stock = dto.stock;

      const newStock = await qR.manager.save(Stock, stock);

      if(!newStock) throw new NotFoundException(`No se pudo actualizar el stock del libro id ${id}`);

      const stockRetorno: StockRetorno = new StockRetorno({
        ...newStock,
        stock:newStock.stock,
        id:newStock.idLibro
      })
      return stockRetorno;
    } catch(er) {
      this.erroresService.handleExceptions(er, `Error al intentar actualizar el stock del libro id ${id}`);
    }
  }


}