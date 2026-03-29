import { Controller } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Precio } from './entity/precio.entity';
import { DtoPrecioCrear } from './dto/precioCrear.dto';
import { DtoPrecioEditar } from './dto/precioEditar.dto';
import { PrecioService } from './precio.service';
import { PRECIO_RELATIONS, PRECIO_SELECTED } from './default/relacion';

@Controller('precio')
export class PrecioController extends BaseController<Precio, DtoPrecioCrear, DtoPrecioEditar> {
  constructor(
    protected readonly precioService: PrecioService,
  ) {
    super(precioService, Entidad.PRECIO, 'precio', [PRECIO_RELATIONS], 'tipo', PRECIO_SELECTED)
  }
}