import { Body, Controller, Delete, Patch, Post, Put } from '@nestjs/common';
import { Base } from './entity/base.entity';
import { BaseService } from './base.service';
import { Get, Param, HttpCode, UseGuards } from '@nestjs/common';
import { UsuarioGuard } from '../auth/guard/user.guard';
import { AdminGuard } from '../auth/guard/admin.guard';
import { BaseDto } from './dto/baseDto';
import { EntidadType } from '@src/gateway/dto/gatewayDto.dto';
import { CreateProp, DeletProp, EditarElementoControllerProp, EditarElementoProp, RelationsKey, SelectedDeep } from './interface/base.interface';
import { UsuarioActual, UsuarioCompleto } from '@src/utils/usuarioActual.decorador';
import { AuthParcialDto } from '@src/auth/dto/authParcial.dto';
import { User } from '@src/user/entity/user.entity';

@Controller('base')
export abstract class BaseController<T extends Base, CrearDto extends BaseDto, EditarDto extends BaseDto> {
  protected constructor(
    protected readonly baseService: BaseService<T, CrearDto, EditarDto>,
    protected readonly entidad: EntidadType,
    protected readonly entidadError?: string,
    protected readonly relaciones?: RelationsKey<T>[],
    protected readonly orden?: keyof T & string,
    protected readonly selected?: SelectedDeep<T>,
  ) { }

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


  @Patch(':id/rehacer')
  @UseGuards(UsuarioGuard, AdminGuard)
  async undoDeleteConstante(
    @UsuarioActual() user: AuthParcialDto,
    @Param('id') id: string
  ): Promise<boolean> {
    const dto: DeletProp<T> = {
      usuarioId: user.sub,
      id,
      entidadError: this.entidadError,
      entidad: this.entidad
    }
    return await this.baseService.undoDelete(dto);
  }
  
  @Delete(':id/eliminar')
  @UseGuards(UsuarioGuard, AdminGuard)
  async deleteConstante(
    @UsuarioActual() user: AuthParcialDto,
    @Param('id') id: string
  ): Promise<Boolean> {
    const dto: DeletProp<T> = {
      usuarioId: user.sub,
      id,
      entidadError: this.entidadError,
      entidad: this.entidad
    }
    return await this.baseService.delete(dto);
  }

  @Delete(':id')
  @UseGuards(UsuarioGuard, AdminGuard)
  async softDeleteConstante(
    @UsuarioActual() user: AuthParcialDto,
    @Param('id') id: string
  ): Promise<Boolean> {
    const dto: DeletProp<T> = {
      usuarioId: user.sub,
      id,
      entidadError: this.entidadError,
      entidad: this.entidad
    }
    return await this.baseService.softDelete(dto);
  }

  @Post()
  @UseGuards(UsuarioGuard, AdminGuard)
  async createDato(
    @UsuarioCompleto() user: User,
    @Body() datos: CrearDto
  ): Promise<boolean> {
    const dto: CreateProp<CrearDto> = {
      dto: datos,
      usuario:user,
      entidad:this.entidad
    }
    const retorno: T = await this.baseService.createDatoCx(dto);
    return retorno ? true : false;
  }

  @Put(':id')
  @UseGuards(UsuarioGuard, AdminGuard)
  async updateDato(
    @UsuarioCompleto() user: User,
    @Param('id') id: string,
    @Body() datos: EditarDto
  ): Promise<boolean> {
    const dto: EditarElementoControllerProp<T, EditarDto> = {
      dto: datos,
      usuarioId: user.id,
      id,
      entidad: this.entidad,
      usuario: user,
      relaciones:this.relaciones,
      selected: this.selected
    }
    const retorno: T = await this.baseService.updateDato(dto);
    return retorno ? true : false;
  }

}
