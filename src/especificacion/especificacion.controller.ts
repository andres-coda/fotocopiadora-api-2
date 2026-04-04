import { Controller } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Especificacion } from './entity/especificacion.entity';
import { DtoEspecificacionCrear } from './dto/DtoCrearEspecificacion.dto';
import { DtoEspecificacionEditar } from './dto/DtoEditarEspecificacion.dto';
import { EspecificacionService } from './especificacion.service';
import { ESPECIFICACION_RELATIONS, SELECTED_ESPECIFICACION } from './default/relacion.default';

@Controller('especificacion')
export class EspecificacionController  extends BaseController<Especificacion, DtoEspecificacionCrear, DtoEspecificacionEditar> {
  constructor(
    protected readonly especificacionService: EspecificacionService,
  ) {
    super(especificacionService, Entidad.ESPECIFICACIONES, 'especificacion', [ESPECIFICACION_RELATIONS], 'nombre', SELECTED_ESPECIFICACION)
  }
}