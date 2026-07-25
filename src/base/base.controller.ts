import { Body, Controller, Delete, Patch, Post, Put, Query, Request } from '@nestjs/common';
import { Base } from './entity/base.entity';
import { BaseService } from './base.service';
import { Get, Param, HttpCode, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '../auth/guard/user.guard';
import { AdminGuard } from '../auth/guard/admin.guard';
import { BaseDto } from './dto/baseDto';
import { EntidadDatoMapType } from '../gateway/dto/gatewayDto.dto';
import type { CreateProp, RetornoGet, SelectedDeep } from './interface/base.interface';
import { DeletProp, EditarElementoControllerProp, RelationsKey } from './interface/base.interface';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';

/**
 * Controlador base genérico.
 *
 * Cambios respecto a la versión anterior:
 *
 * 1. Se eliminó `usuarioId` de todas las llamadas al servicio.
 *    El RLS de PostgreSQL filtra automáticamente por empresa/usuario.
 *
 * 2. Se eliminó `UsuarioCompleto` (que resolvía el User completo desde la BD).
 *    Ahora el `qR` del interceptor se pasa directamente desde `req.queryRunner`.
 *
 * 3. `createDato` y `updateDato` reciben el QueryRunner del request para
 *    operar dentro de la transacción abierta por DbContextInterceptor.
 */

@Controller('base')
@UseGuards(UsuarioGuard)
export abstract class BaseController<
  K extends keyof EntidadDatoMapType,
  T extends Base,
  CrearDto extends BaseDto,
  EditarDto extends BaseDto,
  Servicio extends BaseService<K, T, CrearDto, EditarDto>,
> {
  protected constructor(
    protected readonly baseService: Servicio,
    protected readonly entidad: K,
    protected readonly entidadError?: string,
    protected readonly relaciones?: RelationsKey<T>[],
    protected readonly orden?: keyof T & string,
    protected readonly selected?: SelectedDeep<T>,
    protected readonly relacionesGenerales?: RelationsKey<T>[],
    protected readonly selectedGeneral?: SelectedDeep<T>,
  ) { }

  /**
   * Obtiene todos los elementos activos asociados al usuario autenticado.
   * Aplica filtros por usuario, relaciones y selección de campos configurados.
   * Requiere autenticación de usuario y permisos de administrador.
   * @returns Una promesa que resuelve a un arreglo de elementos.
   */
  @Get()
  @HttpCode(200)
  @UseGuards(UsuarioGuard)
  async findAll(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Request() req: RequestWithUser,
  ): Promise<RetornoGet<K>> {
    const offset = (pagina - 1) * limite;
    const datoRetorno: { datos: EntidadDatoMapType[K][], total: number } = await this.baseService.getDatoCx({
      entidadError: this.entidadError,
      relaciones: this.relacionesGenerales ?? this.relaciones,
      selected: this.selectedGeneral ?? this.selected,
      orden: this.orden,
      limite,
      offset,
      qR: req.queryRunner
    });

    return {
      total: datoRetorno.total,
      limite,
      pagina,
      datos: datoRetorno.datos,
    }
  }


  /**
   * Obtiene un elemento específico por su ID.
   * Valida que el elemento exista y no esté eliminado.
   * Requiere autenticación de usuario y permisos de administrador.
   * @param id - ID del elemento a obtener.
   * @returns Una promesa que resuelve al elemento encontrado.
   */
  @Get(':id')
  @HttpCode(200)
  @UseGuards(UsuarioGuard)
  async findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<EntidadDatoMapType[K]> {
    return this.baseService.getDatoByIdCx({
      id,
      entidadError: this.entidadError,
      relaciones: this.relaciones,
      selected: this.selected,
      qR: req.queryRunner
    });
  }


  /**
   * Deshace el borrado lógico de un elemento (restaura deleted = false).
   * @param id - ID del elemento a restaurar.
   * @returns Una promesa que resuelve a true si la operación fue exitosa.
   */
  @Patch(':id/rehacer')
  @UseGuards(UsuarioGuard)
  async undoDeleteConstante(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    const dto: DeletProp<T, K> = {
      id,
      entidadError: this.entidadError,
      entidad: this.entidad,
      qR: req.queryRunner,
    };
    return this.baseService.undoDelete(dto);
  }

  /**
   * Elimina permanentemente un elemento de la base de datos.
   * @param id - ID del elemento a eliminar.
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa.
   */
  @Delete(':id/eliminar')
  @UseGuards(UsuarioGuard)
  async deleteConstante(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    const dto: DeletProp<T, K> = {
      id,
      entidadError: this.entidadError,
      entidad: this.entidad,
      qR: req.queryRunner,
    };
    return this.baseService.delete(dto);
  }

  /**
   * Realiza un borrado lógico del elemento (marca como eliminado).
   * @param id - ID del elemento a marcar como eliminado.
   * @returns Una promesa que resuelve a true si el borrado lógico fue exitoso.
   */
  @Delete(':id')
  @UseGuards(UsuarioGuard)
  async softDeleteConstante(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    const dto: DeletProp<T, K> = {
      id,
      entidadError: this.entidadError,
      entidad: this.entidad,
      qR: req.queryRunner,
    };
    return this.baseService.softDelete(dto);
  }

  /**
   * Crea un nuevo elemento en la base de datos.
   * Requiere autenticación de usuario y permisos de administrador.
   * @param datos - Datos del DTO para crear el elemento.
   * @returns Una promesa que resuelve a true si la creación fue exitosa.
   */
  @Post()
  @UseGuards(UsuarioGuard)
  async createDato(
    @Body() datos: CrearDto,
    @Request() req: RequestWithUser,
  ): Promise<EntidadDatoMapType[K]> {
    const dto: CreateProp<CrearDto, K> & { qR: any } = {
      dto: datos,
      entidad: this.entidad,
      qR: req.queryRunner,
    };
    return this.baseService.createDatoCx(dto);
  }

  /**
   * Actualiza un elemento existente en la base de datos.
   * Requiere autenticación de usuario y permisos de administrador.
   * @param id - ID del elemento a actualizar.
   * @param datos - Datos del DTO para editar el elemento.
   * @returns Una promesa que resuelve a true si la actualización fue exitosa.
   */
  @Put(':id')
  @UseGuards(UsuarioGuard)
  async updateDato(
    @Param('id') id: string,
    @Body() datos: EditarDto,
    @Request() req: RequestWithUser,
  ): Promise<EntidadDatoMapType[K]> {
    const dto: EditarElementoControllerProp<T, EditarDto, K> = {
      dto: datos,
      id,
      entidad: this.entidad,
      relaciones: this.relaciones,
      selected: this.selected,
      qR: req.queryRunner,
    };
    return this.baseService.updateElementoController(dto);
  }
}
