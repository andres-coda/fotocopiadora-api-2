import { Controller } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Materia } from './entity/materia.entity';
import { DtoMateriaCrear } from './dto/materiaCrear.dto';
import { DtoMateriaEditar } from './dto/materiaEditar.dto';
import { MateriaService } from './materia.service';
import { MATERIA_RELATIONS, MATERIA_SELECTED } from './default/relacion';

@Controller('materia')
export class MateriaController {}


@Controller('precio')
export class PrecioController extends BaseController<Materia, DtoMateriaCrear, DtoMateriaEditar> {
  constructor(
    protected readonly materiaService: MateriaService,
  ) {
    super(materiaService, Entidad.MATERIA, 'precio', [MATERIA_RELATIONS], 'nombre', MATERIA_SELECTED)
  }
}