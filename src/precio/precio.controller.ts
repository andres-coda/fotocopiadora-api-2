import { Controller } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Precio } from './entity/precio.entity';
import { DtoPrecioCrear } from './dto/precioCrear.dto';
import { DtoPrecioEditar } from './dto/precioEditar.dto';
import { PrecioService } from './precio.service';
import { PRECIO_RELATIONS, PRECIO_SELECTED, PRECIO_SELECTED_BY_ID } from './default/relacion';

@Controller('precio')
export class PrecioController extends BaseController<typeof Entidad.PRECIO, Precio, DtoPrecioCrear, DtoPrecioEditar, PrecioService> {
  constructor(
    protected readonly precioService: PrecioService,
  ) {
    super(precioService, Entidad.PRECIO, 'precio', [PRECIO_RELATIONS], 'nombre', PRECIO_SELECTED_BY_ID, undefined, PRECIO_SELECTED)
  }
}