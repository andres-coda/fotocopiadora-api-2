import { Controller, Get, HttpCode, Query, Request, UseGuards } from '@nestjs/common';
import { EspecificacionService } from './especificacion.service';
import { UsuarioGuard } from '@src/auth/guard/user.guard';
import type { RequestWithUser } from '@src/auth/dto/RequestWhitUser.interface';
import { DtoEspecificaionRetorno } from './dto/DtoEspecificacionRetorno.dto';

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

}