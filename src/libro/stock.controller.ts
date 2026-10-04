import { Body, Controller, HttpCode, Param, Put, UseGuards, Request, NotFoundException } from "@nestjs/common";
import { UsuarioGuard } from "@src/auth/guard/user.guard";
import { StockService } from "./stock.service";
import { DtoStockActualizar } from "./dto/stock.dto";
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';
import { StockRetorno } from "./retorno/stock.retorno";

@Controller('libro/stock/:idLibro')
@UseGuards(UsuarioGuard)
export class StockController {
  constructor(
    protected readonly stockService: StockService,
  ) { }

  @Put()
  @HttpCode(201)
  async updateStock(
    @Param('idLibro') id: string,
    @Body() dto: DtoStockActualizar,
    @Request() req: RequestWithUser,
  ): Promise<StockRetorno> {

    if(!req.user.idEmpresa) throw new NotFoundException(`No se puede editar el stock del libro ${id}, el usuario requiere estar adherido a una empresa`);
    
    const stock = await this.stockService.actualizarStok({
      id,
      dto,
      qR: req.queryRunner,
      idEmpresa: req.user.idEmpresa,
    });
    return stock;
  }
}