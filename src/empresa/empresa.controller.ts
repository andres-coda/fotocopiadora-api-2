import { Body, Controller, Get, HttpCode, NotFoundException, Post, Request, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import { SuperAdminGuard } from '@src/auth/guard/superAdmin.guard';
import { Role } from '@src/auth/rol/rol.enum';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { BaseController } from '@src/base/base.controller';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Empresa } from './entity/empresa.entity';
import { DtoEmpresaCrear, DtoEmpresaEditar } from './dto/empresa.dto';
import { EmpresaService } from './empresa.service';
import { EMPRESA_RELATIONS, EMPRESA_SELECTED } from './default/empresa.relacion';
import { EmpresaRetorno } from './retorno/empresa.retorno';
import { EmpresaMiaRetorno, UsuarioEmpresaMia } from './retorno/empresaMia.retorno';
import { Configuracion } from '@src/configuracion/entity/configuracion.entity';
import { User } from '@src/user/entity/user.entity';

@Controller('empresa')
@UseGuards(UsuarioGuard)
export class EmpresaController extends BaseController<typeof Entidad.EMPRESA, Empresa, DtoEmpresaCrear, DtoEmpresaEditar, EmpresaService> {
  constructor(
    protected readonly empresaService: EmpresaService,
  ) {
    super(empresaService, Entidad.EMPRESA, 'empresa', [EMPRESA_RELATIONS], 'nombre', EMPRESA_SELECTED, undefined, EMPRESA_SELECTED)
  }


  /**
   * Crear empresa exige rol super_admin.
   * Se sobreescribe la ruta del BaseController solo para agregar el guard;
   * el resto del comportamiento lo resuelve la implementacion base.
   */
  @Post()
  @UseGuards(SuperAdminGuard)
  async createDato(
    @Body() datos: DtoEmpresaCrear,
    @Request() req: RequestWithUser,
  ): Promise<EmpresaRetorno> {
    return super.createDato(datos, req);
  }
}
