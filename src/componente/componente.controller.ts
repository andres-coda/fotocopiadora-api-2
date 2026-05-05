import { Controller } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Componente } from './entity/componente.entity';
import { DtoComponenteCrear } from './dto/componenteCrear.dto';
import { DtoComponenteEditar } from './dto/componenteEditar.dto';
import { ComponenteService } from './componente.service';
import { COMPONENTE_RELATIONS, SELECTED_COMPONENTE, SELECTED_COMPONENTE_BY_ID } from './default/relacion.default';

@Controller('componente')
export class ComponenteController extends BaseController<typeof Entidad.COMPONENTE, Componente, DtoComponenteCrear, DtoComponenteEditar> {
  constructor(
    protected readonly componenteService: ComponenteService,
  ) {
    super(componenteService, Entidad.COMPONENTE, 'componente', [COMPONENTE_RELATIONS], 'nombre', SELECTED_COMPONENTE_BY_ID, undefined, SELECTED_COMPONENTE)
  }
}