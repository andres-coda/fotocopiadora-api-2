import { Controller } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Sede } from './entity/sede.entity';
import { DtoSedeCrear } from './dto/sedeCrear.dto';
import { DtoSedeEditar } from './dto/sedeEditar.dto';
import { SedeService } from './sede.service';
import { SEDE_RELATIONS, SEDE_SELECTED } from './default/relacion';

@Controller('sede')
export class SedeController extends BaseController<Sede, DtoSedeCrear, DtoSedeEditar> {
  constructor(
    protected readonly sedeService: SedeService,
  ) {
    super(sedeService, Entidad.PRECIO, 'sede', [SEDE_RELATIONS], 'nombre', SEDE_SELECTED)
  }
}