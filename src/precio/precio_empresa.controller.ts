import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsuarioGuard } from '../auth/guard/user.guard';
import { AdminGuard } from '../auth/guard/admin.guard';
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';
import { PrecioEmpresaService } from './precio_empresa.service';
import { DtoPrecioEmpresaCrear, DtoPrecioEmpresaEditar, DtoPrecioEmpresaRespuesta } from './dto/precio_empresa.dto';

/**
 * Endpoints de precios por empresa.
 * Restringido a admin (gestión) y operador (solo lectura via GET).
 * El RLS filtra automáticamente los datos de la empresa del usuario.
 */
@Controller('precio-empresa')
@UseGuards(UsuarioGuard)
export class PrecioEmpresaController {
  constructor(private readonly precioEmpresaService: PrecioEmpresaService) {}

  @Get()
  @HttpCode(200)
  async getAll(@Request() req: RequestWithUser): Promise<DtoPrecioEmpresaRespuesta[]> {
    return this.precioEmpresaService.getPreciosEmpresa(req.queryRunner);
  }

  @Get(':idPrecio')
  @HttpCode(200)
  async getOne(
    @Param('idPrecio') idPrecio: string,
    @Request() req: RequestWithUser,
  ): Promise<DtoPrecioEmpresaRespuesta> {
    return this.precioEmpresaService.getPrecioEmpresaById(idPrecio, req.queryRunner);
  }

  @Post()
  async create(
    @Body() dto: DtoPrecioEmpresaCrear,
    @Request() req: RequestWithUser,
  ): Promise<DtoPrecioEmpresaRespuesta> {
    return this.precioEmpresaService.createPrecioEmpresa(dto, req.queryRunner);
  }

  @Put(':idPrecio')
  async update(
    @Param('idPrecio') idPrecio: string,
    @Body() dto: DtoPrecioEmpresaEditar,
    @Request() req: RequestWithUser,
  ): Promise<DtoPrecioEmpresaRespuesta> {
    return this.precioEmpresaService.updatePrecioEmpresa(idPrecio, dto, req.queryRunner);
  }

  @Delete(':idPrecio')
  async delete(
    @Param('idPrecio') idPrecio: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    return this.precioEmpresaService.deletePrecioEmpresa(idPrecio, req.queryRunner);
  }
}
