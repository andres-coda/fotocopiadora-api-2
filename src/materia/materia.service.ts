import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Materia } from './entity/materia.entity';
import { DtoMateriaCrear } from './dto/materiaCrear.dto';
import { DtoMateriaEditar } from './dto/materiaEditar.dto';
import { MATERIA_RELATIONS, MATERIA_SELECTED } from './default/relacion';
import { DtoMateriaRespuesta } from './dto/materiaRetorno.dto';
import { DtoBaseRetorno } from '../base/dto/baseRetorno.dto';

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

  async createDato({ dto, qR, entidad }: CreateProp<DtoMateriaCrear, typeof Entidad.MATERIA>): Promise<Materia> {
    try {
      const materiaExistente: Materia | null = await this.getDatoByName({
        dato: dto.nombre,
        qR,
        relaciones: [MATERIA_RELATIONS],
        selected: MATERIA_SELECTED,
        entidadError: 'materia'
      });

      if (materiaExistente) return materiaExistente;

      const materia: Materia = new Materia();
      materia.nombre = dto.nombre;

      const newMateria: Materia = qR
        ? await qR.manager.save(Materia, materia)
        : await this.materiaRepository.save(materia);

      return newMateria;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Materia, DtoMateriaEditar, typeof Entidad.MATERIA>): Promise<UpdateRetorno<Materia>> {
    try {
      const materia: Materia = await this.getDatoByIdOrFail({
        id,
        qR,
        relaciones,
        selected,
        entidadError
      });

      if(dto.nombre === materia.nombre) return {dato:materia, isQr:false};
      
      materia.nombre = dto.nombre || materia.nombre;

      const newMateria: Materia = qR
        ? await qR.manager.save(Materia, materia)
        : await this.materiaRepository.save(materia);

      return { dato: newMateria, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de materias`)
    }
  }

  remplaceToReturn(entidad: Materia): DtoMateriaRespuesta {
    const base:DtoBaseRetorno = this.remplaceToBase(entidad);
    return{
      ... base,
      
      nombre: entidad.nombre
    }
  }
}
