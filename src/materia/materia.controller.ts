import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Put, Query, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Materia } from './entity/materia.entity';
import { DtoMateriaCrear } from './dto/materiaCrear.dto';
import { DtoMateriaEditar } from './dto/materiaEditar.dto';
import { MateriaService } from './materia.service';
import { MATERIA_RELATIONS, MATERIA_SELECTED } from './default/relacion';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { DtoBaseRetorno } from '@src/base/dto/baseRetorno.dto';
import { RetornoGenericoControllerGet } from '@src/interface/general.interface';
import { SuperAdminGuard } from '@src/auth/guard/superAdmin.guard';
import { DeletProp, EditarElementoControllerProp } from '@src/base/interface/base.interface';
import { DtoMateriaRespuesta } from './dto/materiaRetorno.dto';

@Controller('materia')
@UseGuards(UsuarioGuard)
export class MateriaController extends BaseController<typeof Entidad.MATERIA, Materia, DtoMateriaCrear, DtoMateriaEditar, MateriaService> {
  constructor(
    protected readonly materiaService: MateriaService,
  ) {
    super(materiaService, Entidad.MATERIA, 'materia', [MATERIA_RELATIONS], 'nombre', MATERIA_SELECTED)
  }

  @Get('todos')
  @HttpCode(200)
  async findAllTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGenericoControllerGet<DtoBaseRetorno>> {
    const offset = (pagina - 1) * limite;
    const retorno = await this.materiaService.getDatoTodosCx({
      limite,
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

  @Patch(':id/rehacer')
  @UseGuards(SuperAdminGuard)
  async undoDeleteConstante(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    const dto: DeletProp<Materia, typeof Entidad.MATERIA> = {
      id,
      entidadError: this.entidadError,
      entidad: this.entidad,
      qR: req.queryRunner,
    };
    return this.baseService.undoDelete(dto);
  }

  @Delete(':id/eliminar')
  @UseGuards(SuperAdminGuard)
  async deleteConstante(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    const dto: DeletProp<Materia, typeof Entidad.MATERIA> = {
      id,
      entidadError: this.entidadError,
      entidad: this.entidad,
      qR: req.queryRunner,
    };
    return this.baseService.delete(dto);
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  async softDeleteConstante(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    const dto: DeletProp<Materia, typeof Entidad.MATERIA> = {
      id,
      entidadError: this.entidadError,
      entidad: this.entidad,
      qR: req.queryRunner,
    };
    return this.baseService.softDelete(dto);
  }

  @Put(':id')
  @UseGuards(SuperAdminGuard)
  async updateDato(
    @Param('id') id: string,
    @Body() datos: DtoMateriaEditar,
    @Request() req: RequestWithUser,
  ): Promise<DtoMateriaRespuesta> {
    const dto: EditarElementoControllerProp<Materia, DtoMateriaEditar, typeof Entidad.MATERIA> = {
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