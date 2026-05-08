import { Controller } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Materia } from './entity/materia.entity';
import { DtoMateriaCrear } from './dto/materiaCrear.dto';
import { DtoMateriaEditar } from './dto/materiaEditar.dto';
import { MateriaService } from './materia.service';
import { MATERIA_RELATIONS, MATERIA_SELECTED } from './default/relacion';
import { DtoMateriaRespuesta } from './dto/materiaRetorno.dto';

@Controller('materia')
export class MateriaController extends BaseController<typeof Entidad.MATERIA, Materia, DtoMateriaCrear, DtoMateriaEditar, DtoMateriaRespuesta, MateriaService> {
  constructor(
    protected readonly materiaService: MateriaService,
  ) {
    super(materiaService, Entidad.MATERIA, 'materia', [MATERIA_RELATIONS], 'nombre', MATERIA_SELECTED)
  }
}