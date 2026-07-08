import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { LibroService } from './libro.service';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '../auth/dto/RequestWhitUser.interface';
import { DtoLibroEmpresaRespuesta, DtoLibroRespuesta } from './dto/libroRetorno.dto';
import { DtoLibroCrear } from './dto/libroCrear.dto';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { RetornoGenericoControllerGet } from '@src/interface/general.interface';

@Controller('libro')
@UseGuards(UsuarioGuard)
export class LibroController {
  constructor(
    protected readonly libroService: LibroService,
  ) { }

  @Get('/:idLibro')
  @HttpCode(200)
  async getLibroById(
    @Param('idLibro') idLibro: string,
    @Request() req: RequestWithUser,
  ): Promise<DtoLibroRespuesta> {
    const libro: DtoLibroRespuesta = await this.libroService.getLibroCompletoByIdOrdFail({
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
    @Query('limite') limite = 20,
    @Query('pagina') pagina = 1,
  ): Promise<RetornoGenericoControllerGet<DtoLibroRespuesta>> {
    const offset = (Number(pagina) - 1) * Number(limite);
    if (busqueda) {
      const retorno = await this.libroService.buscarLibro({
        limite: Number(limite),
        offset,
        qR: req.queryRunner,
        busqueda
      });

      return {
        total: retorno.total,
        limite,
        pagina,
        datos: retorno.datos
      }
    }

    const retorno = await this.libroService.getLibroEmpresa({
      limite: Number(limite),
      offset,
      qR: req.queryRunner
    });

    return {
      total: retorno.total,
      limite,
      pagina,
      datos: retorno.datos
    }
  }

  @Post()
  @HttpCode(201)
  async createLibro(
    @Body() dto: DtoLibroCrear,
    @Request() req: RequestWithUser,
  ): Promise<DtoLibroRespuesta> {
    const libro = await this.libroService.createLibroCompleto({
      dto,
      qR: req.queryRunner,
      entidad: Entidad.LIBRO
    });
    return libro;
  }

  @Put(':idLibro')
  @HttpCode(201)
  async updateLibro(
    @Param('idLibro') idLibro: string,
    @Body() dto: DtoLibroCrear,
    @Request() req: RequestWithUser,
  ): Promise<DtoLibroEmpresaRespuesta> {
    const libro = await this.libroService.updateLibroEmpresa({
      id: idLibro,
      dto,
      qR: req.queryRunner,
      entidad: Entidad.LIBRO
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
