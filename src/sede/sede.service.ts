import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateDefaultProp, CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Sede } from './entity/sede.entity';
import { DtoSedeCrear } from './dto/sedeCrear.dto';
import { DtoSedeEditar } from './dto/sedeEditar.dto';
import { SEDE_RELATIONS, SEDE_SELECTED } from './default/relacion';
import { SEDE_DEFAULT } from './default/sede.default';

@Injectable()
export class SedeService extends BaseService<typeof Entidad.SEDE, Sede, DtoSedeCrear, DtoSedeEditar> {
  constructor(
    @InjectRepository(Sede) private readonly sedeRepository: Repository<Sede>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(sedeRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ usuario, dto, qR, entidad }: CreateProp<DtoSedeCrear, typeof Entidad.SEDE>): Promise<Sede> {
    try {
      const sedeExistente: Sede | null = await this.getDatoByName({
        dato: dto.nombre,
        usuarioId: usuario.id,
        qR,
        relaciones: [SEDE_RELATIONS],
        selected: SEDE_SELECTED,
        entidadError: 'sede'
      });

      if (sedeExistente) return sedeExistente;

      const sede: Sede = new Sede();
      sede.nombre = dto.nombre;
      sede.user = usuario;

      const newSede: Sede = qR
        ? await qR.manager.save(Sede, sede)
        : await this.sedeRepository.save(sede);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad,
          dato: newSede
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return newSede;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Sede, DtoSedeEditar, typeof Entidad.SEDE>): Promise<UpdateRetorno<Sede>> {
    try {
      const sede: Sede = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        relaciones,
        selected,
        entidadError
      });

      sede.nombre = dto.nombre || sede.nombre;

      const newSede: Sede = qR
        ? await qR.manager.save(Sede, sede)
        : await this.sedeRepository.save(sede);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad,
          dato: newSede
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return { dato: newSede, isQr: true };

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de sedes`)
    }
  }

  async createSedeDefault({ usuario, qR }: CreateDefaultProp): Promise<Sede[]> {
    try {
      const sedes: Sede[] = await Promise.all(
        SEDE_DEFAULT.map(sede =>
          this.createDato({ usuario, qR, dto: sede, entidad: Entidad.SEDE })
        )
      );
      return sedes;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear sedes por defecto`)
    }
  }
}
