import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Sede } from './entity/sede.entity';
import { DtoSedeCrear } from './dto/sedeCrear.dto';
import { DtoSedeEditar } from './dto/sedeEditar.dto';
import { SedeService } from './sede.service';
import { SEDE_RELATIONS, SEDE_SELECTED } from './default/relacion';
import { AdminGuard } from '@src/auth/guard/admin.guard';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { CreateProp, DeletProp, EditarElementoControllerProp, RetornoGet } from '@src/base/interface/base.interface';
import { DtoSedeRespuesta } from './dto/sedeRetorno.dto';
import { RetornoGenericoServiceGet } from '@src/interface/general.interface';

@Controller('sede')
export class SedeController extends BaseController<typeof Entidad.SEDE, Sede, DtoSedeCrear, DtoSedeEditar, SedeService> {
  constructor(
    protected readonly sedeService: SedeService,
  ) {
    super(sedeService, Entidad.SEDE, 'sede', [SEDE_RELATIONS], 'nombre', SEDE_SELECTED)
  }

  @Get('todas')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  async findAllTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGet<typeof Entidad.SEDE>> {
    const offset = (pagina - 1) * limite;
    const datoRetorno: RetornoGenericoServiceGet<DtoSedeRespuesta> = await this.baseService.getSedesTodas({
      orden: this.orden,
      limite,
      offset,
      qR: req.queryRunner
    });

    return {
      total: datoRetorno.total,
      limite,
      pagina,
      datos: datoRetorno.datos
    }
  }

  @Patch(':id/rehacer')
  @UseGuards(AdminGuard)
  async undoDeleteConstante(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    const dto: DeletProp<Sede, typeof Entidad.SEDE> = {
      id,
      entidadError: this.entidadError,
      entidad: this.entidad,
      qR: req.queryRunner,
    };
    return this.baseService.undoDelete(dto);
  }

  /**
   * Elimina permanentemente un elemento de la base de datos.
   * @param id - ID del elemento a eliminar.
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa.
   */
  @Delete(':id/eliminar')
  @UseGuards(AdminGuard)
  async deleteConstante(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    const dto: DeletProp<Sede, typeof Entidad.SEDE> = {
      id,
      entidadError: this.entidadError,
      entidad: this.entidad,
      qR: req.queryRunner,
    };
    return this.baseService.delete(dto);
  }

  /**
   * Realiza un borrado lógico del elemento (marca como eliminado).
   * @param id - ID del elemento a marcar como eliminado.
   * @returns Una promesa que resuelve a true si el borrado lógico fue exitoso.
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  async softDeleteConstante(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    const dto: DeletProp<Sede, typeof Entidad.SEDE> = {
      id,
      entidadError: this.entidadError,
      entidad: this.entidad,
      qR: req.queryRunner,
    };
    return this.baseService.softDelete(dto);
  }

  /**
   * Crea un nuevo elemento en la base de datos.
   * Requiere autenticación de usuario y permisos de administrador.
   * @param datos - Datos del DTO para crear el elemento.
   * @returns Una promesa que resuelve a true si la creación fue exitosa.
   */
  @Post()
  @UseGuards(AdminGuard)
  async createDato(
    @Body() datos: DtoSedeCrear,
    @Request() req: RequestWithUser,
  ): Promise<DtoSedeRespuesta> {
    const dto: CreateProp<DtoSedeCrear, typeof Entidad.SEDE> & { qR: any } = {
      dto: datos,
      entidad: this.entidad,
      qR: req.queryRunner,
    };
    return this.baseService.createDatoCx(dto);
  }

  /**
   * Actualiza un elemento existente en la base de datos.
   * Requiere autenticación de usuario y permisos de administrador.
   * @param id - ID del elemento a actualizar.
   * @param datos - Datos del DTO para editar el elemento.
   * @returns Una promesa que resuelve a true si la actualización fue exitosa.
   */
  @Put(':id')
  @UseGuards(AdminGuard)
  async updateDato(
    @Param('id') id: string,
    @Body() datos: DtoSedeEditar,
    @Request() req: RequestWithUser,
  ): Promise<DtoSedeRespuesta> {
    const dto: EditarElementoControllerProp<Sede, DtoSedeEditar, typeof Entidad.SEDE> = {
      dto: datos,
      id,
      entidad: this.entidad,
      relaciones: this.relaciones,
      selected: this.selected,
      qR: req.queryRunner,
    };
    return this.baseService.updateElementoController(dto);
  }

}