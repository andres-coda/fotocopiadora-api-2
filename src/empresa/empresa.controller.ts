import { Controller, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Empresa } from './entity/empresa.entity';
import { DtoEmpresaCrear, DtoEmpresaEditar } from './dto/empresa.dto';
import { EmpresaService } from './empresa.service';
import { EMPRESA_RELATIONS, EMPRESA_SELECTED } from './default/empresa.relacion';

@Controller('empresa')
@UseGuards(UsuarioGuard)
export class EmpresaController extends BaseController<typeof Entidad.EMPRESA, Empresa, DtoEmpresaCrear, DtoEmpresaEditar, EmpresaService> {
  constructor(
    protected readonly componenteService: EmpresaService,
  ) {
    super(componenteService, Entidad.EMPRESA, 'empresa', [EMPRESA_RELATIONS], 'nombre', EMPRESA_SELECTED, undefined, EMPRESA_SELECTED)
  }
}