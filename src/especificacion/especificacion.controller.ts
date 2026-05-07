import { Controller } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Especificacion } from './entity/especificacion.entity';
import { DtoEspecificacionCrear } from './dto/DtoCrearEspecificacion.dto';
import { DtoEspecificacionEditar } from './dto/DtoEditarEspecificacion.dto';
import { EspecificacionService } from './especificacion.service';
import { ESPECIFICACION_RELATIONS, SELECTED_ESPECIFICACION } from './default/relacion.default';

@Controller('especificacion')
export class EspecificacionController  extends BaseController<typeof Entidad.ESP,Especificacion, DtoEspecificacionCrear, DtoEspecificacionEditar, EspecificacionService> {
  constructor(
    protected readonly especificacionService: EspecificacionService,
  ) {
    super(especificacionService, Entidad.ESP, 'esp', [ESPECIFICACION_RELATIONS], 'nombre', SELECTED_ESPECIFICACION)
  }
}