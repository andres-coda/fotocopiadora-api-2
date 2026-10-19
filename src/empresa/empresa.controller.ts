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
   * Vista de la empresa del usuario autenticado.
   * Se declara antes del GET ':id' heredado del BaseController para que la
   * ruta fija no sea capturada por el parametro.
   * La empresa se resuelve desde el token: el cliente nunca elige el id.
   * Devuelve el mismo shape que GET /empresa/:id (vw_empresa_completa).
   */
  @Get('mia')
  @HttpCode(200)
  async getEmpresaMia(@Request() req: RequestWithUser): Promise<EmpresaRetorno> {
    const idEmpresa: string | null | undefined = req.user?.idEmpresa;
    if (!idEmpresa) throw new NotFoundException('El usuario no tiene una empresa asociada');

    return this.empresaService.getDatoByIdCx({ id: idEmpresa, qR: req.queryRunner });
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
