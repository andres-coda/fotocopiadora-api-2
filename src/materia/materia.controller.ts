import { Controller, Get, HttpCode, Query, Request, UseGuards } from '@nestjs/common';
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
}