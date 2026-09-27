import { Controller, Get, HttpCode, Query, Request, UseGuards, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { EspecificacionService } from './especificacion.service';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { DtoEspecificacionCrear } from './dto/DtoCrearEspecificacion.dto';
import { SuperAdminGuard } from '@src/auth/guard/superAdmin.guard';
import { DtoEspecificacionEditar } from './dto/DtoEditarEspecificacion.dto';
import { EspecificacionRetorno } from './retorno/especificacion.retorno';

@Controller('especificacion')
@UseGuards(UsuarioGuard)
export class EspecificacionController {
  constructor(
    protected readonly especificacionService: EspecificacionService,
  ) { }

  @Get()
  @HttpCode(200)
  async getEspecificaciones(
    @Request() req: RequestWithUser,
    @Query('deleted') deleted = false,
  ): Promise<EspecificacionRetorno[]> {
    if(!deleted){
      const retorno: EspecificacionRetorno[] = await this.especificacionService.getEspecificacionesCx(req.queryRunner);
      return retorno
    }

    return await this.especificacionService.getEspecificacionesEliminadas(req.queryRunner);
  }

  @Get(':id')
  @HttpCode(200)
  async getEspecificacionById(
    @Param('id') id:string, 
    @Request() req: RequestWithUser,
  ): Promise<EspecificacionRetorno> {
    
    return await this.especificacionService.getEspecificacionByIdCx({id, qR: req.queryRunner});
  }

  @Post()
  @HttpCode(201)
  @UseGuards(SuperAdminGuard)
  async createEspecificacion(
    @Body() dto: DtoEspecificacionCrear,
    @Request() req: RequestWithUser,
  ): Promise<EspecificacionRetorno> {
    const item = await this.especificacionService.createEspecificacionCx({
      dto,
      qR: req.queryRunner,
    });
    return item;
  }

  @Put(':idEsp')
  @HttpCode(200)
  @UseGuards(SuperAdminGuard)
  async updateEspecificacion(
    @Param('idEsp') idEspecificacion: string,
    @Body() dto: DtoEspecificacionEditar,
    @Request() req: RequestWithUser,
  ): Promise<EspecificacionRetorno> {
    const esp = await this.especificacionService.updateEspecificacionCx({
      id: idEspecificacion,
      dto,
      qR: req.queryRunner,
    });
    return esp;
  }

  @Delete(':idEsp')
  @HttpCode(200)
  @UseGuards(SuperAdminGuard)
  async deleteEspecificacion(
    @Param('idEsp') idEspecificacion: string,
    @Request() req: RequestWithUser,
  ): Promise<boolean> {
    return this.especificacionService.deleteEspecificacion({ id:idEspecificacion, qR: req.queryRunner });
  }

}