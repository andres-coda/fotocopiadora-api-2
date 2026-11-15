import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { LibroService } from './libro.service';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';
import { DtoLibroCrear, DtoLibroEmpresaEditar } from './dto/libroCrear.dto';
import { RetornoGenericoControllerGet } from '@src/interface/general.interface';
import { LibroRetorno } from './retorno/libro.retorno';
import { SuperAdminGuard } from '@src/auth/guard/superAdmin.guard';
import { DtoLibroExtraEditar, DtoLibroPrincipalEditar } from './dto/libroEditar.dto';
import { parsearPaginado } from '@src/utils/paginado';

@Controller('libro')
@UseGuards(UsuarioGuard)
export class LibroController {
  constructor(
    protected readonly libroService: LibroService,
  ) { }

  @Get('/completo/:idLibro')
  @HttpCode(200)
  async getLibrosCompletoBusqueda(
    @Request() req: RequestWithUser,
    @Param('idLibro') idLibro: string,
    @Query('comp') componentes: string | undefined = undefined,
    @Query('nivel') nivel: string | undefined = undefined,
    @Query('limite') limiteQuery: string | undefined,
    @Query('pagina') paginaQuery: string | undefined,
  ): Promise<RetornoGenericoControllerGet<LibroRetorno> | undefined> {
    const { pagina, limite, offset } = parsearPaginado(paginaQuery, limiteQuery);

    const retorno = await this.libroService.buscarLibroCompleto({
      limite,
      offset,
      qR: req.queryRunner,
      id: idLibro,
      componentes,
      nivel
    });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos,
      query: `{id:${idLibro}, comp: ${componentes}, nivel: ${nivel}`,
    }
  }

  @Get('/nombre')
  @HttpCode(200)
  async getLibrosNombreBusqueda(
    @Request() req: RequestWithUser,
    @Query('q') busqueda: string,
    @Query('limite') limiteQuery: string | undefined,
    @Query('pagina') paginaQuery: string | undefined,
  ): Promise<RetornoGenericoControllerGet<LibroRetorno> | undefined> {
    const { pagina, limite, offset } = parsearPaginado(paginaQuery, limiteQuery);

    if (!busqueda || busqueda.length < 3) return undefined;

    const retorno = await this.libroService.buscarLibroNombre({
      limite,
      offset,
      qR: req.queryRunner,
      busqueda
    });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos,
      query: busqueda ?? '',
    }
  }


  @Get('/:idLibro')
  @HttpCode(200)
  async getLibroById(
    @Param('idLibro') idLibro: string,
    @Request() req: RequestWithUser,
  ): Promise<LibroRetorno> {
    const libro: LibroRetorno = await this.libroService.getLibroCompletoByIdOrdFail({
      id: idLibro,
      qR: req.queryRunner
    });
    return libro;
  }

  @Get()
  @HttpCode(200)
  async getLibrosBusqueda(
    @Request() req: RequestWithUser,
    @Query('q') busqueda: string,
    @Query('limite') limiteQuery: string | undefined,
    @Query('pagina') paginaQuery: string | undefined,
  ): Promise<RetornoGenericoControllerGet<LibroRetorno>> {
    const { pagina, limite, offset } = parsearPaginado(paginaQuery, limiteQuery);
    if (busqueda) {
      const retorno = await this.libroService.buscarLibro({
        limite,
        offset,
        qR: req.queryRunner,
        busqueda
      });

      return {
        total: retorno.total,
        limite,
        pagina,
        datos: retorno.datos,
        query: busqueda ?? '',
      }
    }

    const retorno = await this.libroService.getLibroEmpresa({
      limite,
      offset,
      qR: req.queryRunner
    });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos,
      query: busqueda ?? '',
    }
  }

  @Post()
  @HttpCode(201)
  async createLibro(
    @Body() dto: DtoLibroCrear,
    @Request() req: RequestWithUser,
  ): Promise<LibroRetorno> {
    const libro = await this.libroService.createLibroCompleto({
      dto,
      qR: req.queryRunner
    });
    return libro;
  }

  @Patch(':idLibro')
  @HttpCode(201)
  async updateLibroEmpresa(
    @Param('idLibro') idLibro: string,
    @Body() dto: DtoLibroEmpresaEditar,
    @Request() req: RequestWithUser,
  ): Promise<LibroRetorno> {
    const libro = await this.libroService.updateLibroEmpresa({
      id: idLibro,
      dto,
      qR: req.queryRunner
    });
    return libro;
  }

  @Patch('extra/:idLibro')
  @HttpCode(201)
  async updateLibroExtra(
    @Param('idLibro') idLibro: string,
    @Body() dto: DtoLibroExtraEditar,
    @Request() req: RequestWithUser,
  ): Promise<LibroRetorno> {
    if (!req.user.idEmpresa) throw new NotFoundException('No puede editar el libro porque no tiene acceso a la empresa');
    const libro = await this.libroService.updateLibroExtra({
      id: idLibro,
      dto,
      qR: req.queryRunner,
      id_empresa: req.user.idEmpresa,
      id_usuario: req.user.sub,
    });
    return libro;
  }

  @Patch('principal/:idLibro')
  @HttpCode(201)
  async updateLibroPrincipal(
    @Param('idLibro') idLibro: string,
    @Body() dto: DtoLibroPrincipalEditar,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    const libro = await this.libroService.updateLibroPrincipal({
      id: idLibro,
      dto,
      qR: req.queryRunner,
    });
    return libro;
  }

  @UseGuards(SuperAdminGuard)
  @Put(':idLibro')
  @HttpCode(201)
  async updateLibro(
    @Param('idLibro') idLibro: string,
    @Body() dto: DtoLibroEmpresaEditar,
    @Request() req: RequestWithUser,
  ): Promise<LibroRetorno | undefined> {
    const libro = await this.libroService.updateLibroCompleto({
      id: idLibro,
      dto,
      qR: req.queryRunner
    });
    return libro;
  }

  @Delete(':idLibro')
  @HttpCode(201)
  async deleteLibro(
    @Param('idLibro') idLibro: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    const libro = await this.libroService.deleteLibroEmpresa({
      id: idLibro,
      qR: req.queryRunner,
    });
    return libro;
  }

}
