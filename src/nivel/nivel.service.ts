import { Injectable } from '@nestjs/common';
import { BaseService } from '@src/base/base.service';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Nivel } from './entity/nivel.entity';
import { DtoNivelCrear, DtoNivelEditar, DtoNivelRespuesta } from './dto/nivel.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, ILike, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '@src/base/interface/base.interface';
import { NIVEL_RELATIONS, SELECTED_NIVEL } from './default/nivel.relacion';
import { BusquedaGenericoProp, RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { DtoBaseRetorno } from '@src/base/dto/baseRetorno.dto';

@Injectable()
export class NivelService extends BaseService<typeof Entidad.NIVEL, Nivel, DtoNivelCrear, DtoNivelEditar> {
  constructor(
    @InjectRepository(Nivel) private readonly nivelRepository: Repository<Nivel>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(nivelRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ dto, qR, entidad }: CreateProp<DtoNivelCrear, typeof Entidad.NIVEL>): Promise<Nivel> {
    try {
      const nivelExistente: Nivel | null = await this.getDatoByName({
        dato: dto.nombre,
        qR,
        relaciones: [NIVEL_RELATIONS],
        selected: SELECTED_NIVEL,
        entidadError: 'nivel'
      });

      if (nivelExistente) return nivelExistente;

      const nivel: Nivel = new Nivel();
      nivel.nombre = dto.nombre;

      const newNivel: Nivel = qR
        ? await qR.manager.save(Nivel, nivel)
        : await this.nivelRepository.save(nivel);

      return newNivel;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Nivel, DtoNivelEditar, typeof Entidad.NIVEL>): Promise<UpdateRetorno<Nivel>> {
    try {
      const nivel: Nivel = await this.getDatoByIdOrFail({
        id,
        qR,
        relaciones,
        selected,
        entidadError
      });

      if (nivel.nombre === dto.nombre) return { dato: nivel, isQr: false };
      nivel.nombre = dto.nombre || nivel.nombre;

      const newNivel: Nivel = qR
        ? await qR.manager.save(Nivel, nivel)
        : await this.nivelRepository.save(nivel);

      return { dato: newNivel, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de nivel`)
    }
  }

  async buscarNivelNombre({ busqueda, limite = 20, offset = 0, qR }: BusquedaGenericoProp): Promise<RetornoGenericoServiceGet<DtoNivelRespuesta>> {
    try {
      const criterio: FindManyOptions = {
        relations: [],
        where: {
          nombre: ILike(`%${busqueda}%`)
        },
        take: limite ?? 20,
        skip: offset ?? 0
      }

      const [datos, total] = await qR.manager.findAndCount(Nivel, criterio);

      return {
        total,
        datos: datos.map((pe) => this.remplaceToReturn(pe))
      }
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar la busqueda de ${busqueda}`);
    }
  }

  public remplaceToReturn(entidad: Nivel): DtoNivelRespuesta {
    const base: DtoBaseRetorno = this.remplaceToBase(entidad);
    return {
      ...base,

      nombre: entidad.nombre
    }
  }
}
