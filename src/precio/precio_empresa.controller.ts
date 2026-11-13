import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '../auth/guard/user.guard';
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';
import { PrecioEmpresaService } from './precio_empresa.service';
import { DtoPrecioEmpresaCrear, DtoPrecioEmpresaEditar } from './dto/precio_empresa.dto';
import { RetornoGenericoControllerGet } from '@src/interface/general.interface';
import { PrecioRetorno } from './retorno/precio.retorno';

/** Un query param repetible llega como string o string[]; se normaliza a lista. */
const normalizarLista = (valor?: string | string[]): string[] =>
  (Array.isArray(valor) ? valor : valor ? [valor] : []).filter(v => v.trim().length > 0);

/**
 * Endpoints de precios por empresa.
 * Restringido a admin (gestión) y operador (solo lectura via GET).
 * El RLS filtra automáticamente los datos de la empresa del usuario.
 */
@Controller('precio-empresa')
@UseGuards(UsuarioGuard)
export class PrecioEmpresaController {
  constructor(private readonly precioEmpresaService: PrecioEmpresaService) { }

  /**
   * `bloqueado=true` limita la lista a las categorias bloqueadas (la carga
   * inicial de precios del front). `categoria` es repetible y filtra por uno o
   * varios ids de categoria.
   */
  @Get()
  @HttpCode(200)
  async getAll(
    @Query('q') busqueda: string,
    @Query('categoria') categoria: string | string[] | undefined,
    @Query('bloqueado') bloqueado: string | undefined,
    @Query('limite') limite = 20,
    @Query('pagina') pagDto = 1,
    @Request() req: RequestWithUser
  ): Promise<RetornoGenericoControllerGet<PrecioRetorno>> {

    const pagina = Number(pagDto) > 0 ? Number(pagDto) : 1;
    const offset = (pagina - 1) * limite;

    const filtros = {
      bloqueado: bloqueado === 'true',
      categorias: normalizarLista(categoria),
    };

    if (!busqueda || busqueda.length < 3) {
      const datos = await this.precioEmpresaService.getPreciosEmpresa({ qR: req.queryRunner, limite, offset, ...filtros });
      return {
        total: datos.total,
        limite,
        pagina,
        datos: datos.datos,
        query: busqueda ?? '',
      }
    }

    const datos = await this.precioEmpresaService.getPreciosEmpresaBusqueda({ qR: req.queryRunner, busqueda, limite, offset, ...filtros });

    return {
      total: datos.total,
      limite,
      pagina,
      datos: datos.datos,
      query: busqueda ?? '',
    }
  }

  @Get(':idPrecio')
  @HttpCode(200)
  async getOne(
    @Param('idPrecio') id: string,
    @Request() req: RequestWithUser,
  ): Promise<PrecioRetorno> {
    return this.precioEmpresaService.getPrecioEmpresaByIdOrFailCx({ id, qR: req.queryRunner });
  }

  @Post()
  async create(
    @Body() dto: DtoPrecioEmpresaCrear,
    @Request() req: RequestWithUser,
  ): Promise<PrecioRetorno> {
    return this.precioEmpresaService.createPrecioEmpresa({ dto, qR: req.queryRunner });
  }

  @Put(':idPrecio')
  async update(
    @Param('idPrecio') id: string,
    @Body() dto: DtoPrecioEmpresaEditar,
    @Request() req: RequestWithUser,
  ): Promise<PrecioRetorno> {
    return this.precioEmpresaService.updatePrecioEmpresa({ id, dto, qR: req.queryRunner });
  }

  @Delete(':idPrecio')
  async delete(
    @Param('idPrecio') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    return this.precioEmpresaService.deletePrecioEmpresa({ id, qR: req.queryRunner });
  }
}
