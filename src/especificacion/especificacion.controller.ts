import { Controller, Get, HttpCode, Query, Request, UseGuards, Post, Param, Body } from '@nestjs/common';
import { EspecificacionService } from './especificacion.service';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { DtoEspecificaionRetorno } from './dto/DtoEspecificacionRetorno.dto';
import { DtoEspecificacionCrear } from './dto/DtoCrearEspecificacion.dto';
import { SuperAdminGuard } from '@src/auth/guard/superAdmin.guard';

@Controller('especificacion')
@UseGuards(UsuarioGuard)
export class EspecificacionController {
  constructor(
    protected readonly especificacionService: EspecificacionService,
  ) { }

  @Get()
  @HttpCode(200)
  async findAll(
    @Request() req: RequestWithUser,
  ): Promise<DtoEspecificaionRetorno[]> {
    const retorno: DtoEspecificaionRetorno[] = await this.especificacionService.getEspecificacionesCx(req.queryRunner);
    return retorno
  }

  @Post()
  @HttpCode(201)
  @UseGuards(SuperAdminGuard)
  async create(
    @Body() dto: DtoEspecificacionCrear,
    @Request() req: RequestWithUser,
  ): Promise<DtoEspecificaionRetorno> {
    const item = await this.especificacionService.createEspecificacionCx({
      dto,
      qR:req.queryRunner,
  });
    return item;
  }

}