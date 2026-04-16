import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Materia } from './entity/materia.entity';
import { DtoMateriaCrear } from './dto/materiaCrear.dto';
import { DtoMateriaEditar } from './dto/materiaEditar.dto';
import { MATERIA_RELATIONS, MATERIA_SELECTED } from './default/relacion';

@Injectable()
export class MateriaService extends BaseService<typeof Entidad.MATERIA, Materia, DtoMateriaCrear, DtoMateriaEditar> {
  constructor(
    @InjectRepository(Materia) private readonly materiaRepository: Repository<Materia>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(materiaRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ usuario, dto, qR, entidad }: CreateProp<DtoMateriaCrear, typeof Entidad.MATERIA>): Promise<Materia> {
    try {
      const materiaExistente: Materia | null = await this.getDatoByName({
        dato: dto.nombre,
        usuarioId: usuario.id,
        qR,
        relaciones: [MATERIA_RELATIONS],
        selected: MATERIA_SELECTED,
        entidadError: 'materia'
      });

      if (materiaExistente) return materiaExistente;

      const materia: Materia = new Materia();
      materia.nombre = dto.nombre;
      materia.user = usuario;

      const newMateria: Materia = qR
        ? await qR.manager.save(Materia, materia)
        : await this.materiaRepository.save(materia);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad,
          dato: newMateria
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return newMateria;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Materia, DtoMateriaEditar,typeof Entidad.MATERIA>): Promise<UpdateRetorno<Materia>> {
    try {
      const materia: Materia = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        relaciones,
        selected,
        entidadError
      });

      materia.nombre = dto.nombre || materia.nombre;

      const newMateria: Materia = qR
        ? await qR.manager.save(Materia, materia)
        : await this.materiaRepository.save(materia);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad,
          dato: newMateria
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return { dato: newMateria, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de materias`)
    }
  }
}
