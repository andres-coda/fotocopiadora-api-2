import { Body, Controller, Delete, Patch, Post, Put } from '@nestjs/common';
import { Base } from './entity/base.entity';
import { BaseService } from './base.service';
import { Get, Param, HttpCode, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '../auth/guard/user.guard';
import { AdminGuard } from '../auth/guard/admin.guard';
import { BaseDto } from './dto/baseDto';
import { EntidadDatoMapType } from '@src/gateway/dto/gatewayDto.dto';
import { CreateProp, DeletProp, EditarElementoControllerProp, EditarElementoProp, RelationsKey, SelectedDeep, UpdateRetorno } from './interface/base.interface';
import { UsuarioActual, UsuarioCompleto } from '@src/utils/usuarioActual.decorador';
import { AuthParcialDto } from '@src/auth/dto/authParcial.dto';
import { User } from '@src/user/entity/user.entity';

@Controller('base')
export abstract class BaseController<K extends keyof EntidadDatoMapType, T extends Base & EntidadDatoMapType[K], CrearDto extends BaseDto, EditarDto extends BaseDto> {
  protected constructor(
    protected readonly baseService: BaseService<K, T, CrearDto, EditarDto>,
    protected readonly entidad: K,
    protected readonly entidadError?: string,
    protected readonly relaciones?: RelationsKey<T>[],
    protected readonly orden?: keyof T & string,
    protected readonly selected?: SelectedDeep<T>,
  ) { }

  /**
   * Obtiene todos los elementos activos asociados al usuario autenticado.
   * Aplica filtros por usuario, relaciones y selección de campos configurados.
   * Requiere autenticación de usuario y permisos de administrador.
   * @param user - Información del usuario autenticado.
   * @returns Una promesa que resuelve a un arreglo de elementos.
   */
  @Get()
  @HttpCode(200)
  @UseGuards(UsuarioGuard, AdminGuard)
  async findAll(
    @UsuarioActual() user: AuthParcialDto,
  ): Promise<T[]> {
    return this.baseService.getDato({
      usuarioId: user.sub,
      entidadError: this.entidadError,
      relaciones: this.relaciones,
      selected: this.selected,
      orden: this.orden
    });
  }


  /**
   * Obtiene un elemento específico por su ID.
   * Valida que el elemento exista y no esté eliminado.
   * Requiere autenticación de usuario y permisos de administrador.
   * @param id - ID del elemento a obtener.
   * @param user - Información del usuario autenticado.
   * @returns Una promesa que resuelve al elemento encontrado.
   */
  @Get(':id')
  @HttpCode(200)
  @UseGuards(UsuarioGuard, AdminGuard)
  async findOne(
    @Param('id') id: string,
    @UsuarioActual() user: AuthParcialDto,
  ): Promise<T> {
    const item = await this.baseService.getDatoByIdOrFail({
      id,
      usuarioId: user.sub,
      entidadError: this.entidadError,
      relaciones: this.relaciones,
      selected: this.selected,
    });
    return item;
  }


  /**
   * Deshace el borrado lógico de un elemento (restaura deleted = false).
   * Requiere autenticación de usuario y permisos de administrador.
   * @param user - Información del usuario autenticado.
   * @param id - ID del elemento a restaurar.
   * @returns Una promesa que resuelve a true si la operación fue exitosa.
   */
  @Patch(':id/rehacer')
  @UseGuards(UsuarioGuard, AdminGuard)
  async undoDeleteConstante(
    @UsuarioActual() user: AuthParcialDto,
    @Param('id') id: string
  ): Promise<boolean> {
    const dto: DeletProp<T, K> = {
      usuarioId: user.sub,
      id,
      entidadError: this.entidadError,
      entidad: this.entidad
    }
    return await this.baseService.undoDelete(dto);
  }
  
  /**
   * Elimina permanentemente un elemento de la base de datos.
   * Requiere autenticación de usuario y permisos de administrador.
   * @param user - Información del usuario autenticado.
   * @param id - ID del elemento a eliminar.
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa.
   */
  @Delete(':id/eliminar')
  @UseGuards(UsuarioGuard, AdminGuard)
  async deleteConstante(
    @UsuarioActual() user: AuthParcialDto,
    @Param('id') id: string
  ): Promise<Boolean> {
    const dto: DeletProp<T,K> = {
      usuarioId: user.sub,
      id,
      entidadError: this.entidadError,
      entidad: this.entidad
    }
    return await this.baseService.delete(dto);
  }

  /**
   * Realiza un borrado lógico del elemento (marca como eliminado).
   * Requiere autenticación de usuario y permisos de administrador.
   * @param user - Información del usuario autenticado.
   * @param id - ID del elemento a marcar como eliminado.
   * @returns Una promesa que resuelve a true si el borrado lógico fue exitoso.
   */
  @Delete(':id')
  @UseGuards(UsuarioGuard, AdminGuard)
  async softDeleteConstante(
    @UsuarioActual() user: AuthParcialDto,
    @Param('id') id: string
  ): Promise<Boolean> {
    const dto: DeletProp<T,K> = {
      usuarioId: user.sub,
      id,
      entidadError: this.entidadError,
      entidad: this.entidad
    }
    return await this.baseService.softDelete(dto);
  }

  /**
   * Crea un nuevo elemento en la base de datos.
   * Requiere autenticación de usuario y permisos de administrador.
   * @param user - Información completa del usuario autenticado.
   * @param datos - Datos del DTO para crear el elemento.
   * @returns Una promesa que resuelve a true si la creación fue exitosa.
   */
  @Post()
  @UseGuards(UsuarioGuard, AdminGuard)
  async createDato(
    @UsuarioCompleto() user: User,
    @Body() datos: CrearDto
  ): Promise<boolean> {
    const dto: CreateProp<CrearDto,K> = {
      dto: datos,
      usuario:user,
      entidad:this.entidad
    }
    const retorno: T = await this.baseService.createDatoCx(dto);
    return retorno ? true : false;
  }

  /**
   * Actualiza un elemento existente en la base de datos.
   * Requiere autenticación de usuario y permisos de administrador.
   * @param user - Información completa del usuario autenticado.
   * @param id - ID del elemento a actualizar.
   * @param datos - Datos del DTO para editar el elemento.
   * @returns Una promesa que resuelve a true si la actualización fue exitosa.
   */
  @Put(':id')
  @UseGuards(UsuarioGuard, AdminGuard)
  async updateDato(
    @UsuarioCompleto() user: User,
    @Param('id') id: string,
    @Body() datos: EditarDto
  ): Promise<boolean> {
    const dto: EditarElementoControllerProp<T, EditarDto,K> = {
      dto: datos,
      usuarioId: user.id,
      id,
      entidad: this.entidad,
      usuario: user,
      relaciones:this.relaciones,
      selected: this.selected
    }
    const retorno: UpdateRetorno<T>= await this.baseService.updateDato(dto);
    return retorno.dato ? true : false;
  }

}
