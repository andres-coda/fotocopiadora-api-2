import { Body, Controller, HttpCode, Param, Put, UseGuards, Request } from "@nestjs/common";
import { UsuarioGuard } from "@src/auth/guard/user.guard";
import { StockService } from "./stock.service";
import { DtoStockActualizar, DtoStockRespuesta } from "./dto/stock.dto";
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';

@Controller('libro/:idLibro/stock')
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
  ): Promise<DtoStockRespuesta> {
    const stock = await this.stockService.actualizarStok({
      id,
      dto,
      qR: req.queryRunner
    });
    return stock;
  }
}