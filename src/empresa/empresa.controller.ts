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
    protected readonly componenteService: EmpresaService,
  ) {
    super(componenteService, Entidad.EMPRESA, 'empresa', [EMPRESA_RELATIONS], 'nombre', EMPRESA_SELECTED, undefined, EMPRESA_SELECTED)
  }

  /**
   * Vista de la empresa del usuario autenticado.
   * Se declara antes del GET ':id' heredado del BaseController para que
   * la ruta fija no sea capturada por el parametro.
   * Devuelve los datos de la empresa, su fila de configuraciones con los
   * nombres resueltos por join y, solo para admin, la lista de usuarios.
   */
  @Get('mia')
  @HttpCode(200)
  async getEmpresaMia(
    @Request() req: RequestWithUser,
  ): Promise<EmpresaMiaRetorno> {
    const idEmpresa: string | null | undefined = req.user.idEmpresa;
    if (!idEmpresa) throw new NotFoundException('El usuario no tiene una empresa asociada');

    const empresa: Empresa | null = await this.componenteService.getDatoById({
      id: idEmpresa,
      qR: req.queryRunner,
      entidadError: 'empresa',
    });
    if (!empresa) throw new NotFoundException('No se encontro la empresa del usuario');

    // Los join resuelven los nombres; si un id es null o apunta a algo que
    // el RLS oculta, la relacion llega null y el nombre tambien.
    const configuracion: Configuracion | null = await req.queryRunner.manager.findOne(Configuracion, {
      where: { idEmpresa },
      relations: {
        sede: true,
        datoCobro: true,
        msjPedidoTomado: true,
        msjPedidoRetirado: true,
      },
    });

    // Los usuarios solo se exponen para admin: el super_admin saltea la RLS
    // y una consulta sin filtro podria devolver usuarios de todas las empresas.
    let usuarios: UsuarioEmpresaMia[] | undefined;
    if (req.user.role === Role.Admin) {
      const datos: User[] = await req.queryRunner.manager.find(User, {
        where: { idEmpresa, deleted: false },
        order: { nombre: 'ASC' },
        select: { id: true, nombre: true, email: true, role: true },
      });
      usuarios = datos.map((usuario) => ({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        role: usuario.role,
      }));
    }

    return {
      id: empresa.id,
      fechaCreacion: empresa.fechaCreacion,
      fechaActualizacion: empresa.fechaActualizacion,
      deleted: empresa.deleted,
      nombre: empresa.nombre,
      telefono: empresa.telefono,
      email: empresa.email,
      configuracion: configuracion
        ? {
          fechaActualizacion: configuracion.fechaActualizacion,
          fechaEntrega: configuracion.fechaEntrega ?? null,
          horaEntrega: configuracion.horaEntrega ?? null,
          msjRetiro: configuracion.msjRetiro ?? null,
          msjEnvio: configuracion.msjEnvio ?? null,
          sede: configuracion.sede?.nombre ?? null,
          datoCobro: configuracion.datoCobro?.nombre ?? null,
          msjPedidoTomado: configuracion.msjPedidoTomado?.nombre ?? null,
          msjPedidoRetirado: configuracion.msjPedidoRetirado?.nombre ?? null,
        }
        : null,
      ...(usuarios !== undefined ? { usuarios } : {}),
    };
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
