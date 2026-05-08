import { Controller } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Sede } from './entity/sede.entity';
import { DtoSedeCrear } from './dto/sedeCrear.dto';
import { DtoSedeEditar } from './dto/sedeEditar.dto';
import { SedeService } from './sede.service';
import { SEDE_RELATIONS, SEDE_SELECTED } from './default/relacion';
import { DtoSedeRespuesta } from './dto/sedeRetorno.dto';

@Controller('sede')
export class SedeController extends BaseController<typeof Entidad.SEDE, Sede, DtoSedeCrear, DtoSedeEditar, SedeService> {
  constructor(
    protected readonly sedeService: SedeService,
  ) {
    super(sedeService, Entidad.SEDE, 'sede', [SEDE_RELATIONS], 'nombre', SEDE_SELECTED)
  }
}