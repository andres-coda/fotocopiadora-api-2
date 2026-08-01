import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, ILike, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { Componente } from './entity/componente.entity';
import { DtoComponenteCrear } from './dto/componenteCrear.dto';
import { DtoComponenteEditar } from './dto/componenteEditar.dto';
import { COMPONENTE_RELATIONS, SELECTED_COMPONENTE } from './default/relacion.default';
import { DtoComponenteRespuesta } from './dto/componenteRetorno.dto';
import { DtoBaseRetorno } from '../base/dto/baseRetorno.dto';
import { BusquedaGenericoProp, RetornoGenericoServiceGet } from '@src/interface/general.interface';

@Injectable()
export class ComponenteService extends BaseService<typeof Entidad.COMPONENTE, Componente, DtoComponenteCrear, DtoComponenteEditar> {
  constructor(
    @InjectRepository(Componente) private readonly componenteRepository: Repository<Componente>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(componenteRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ dto, qR, entidad }: CreateProp<DtoComponenteCrear, typeof Entidad.COMPONENTE>): Promise<Componente> {
    try {
      const componenteExistente: Componente | null = await this.getDatoByName({
        dato: dto.nombre,
        qR,
        relaciones: [COMPONENTE_RELATIONS],
        selected: SELECTED_COMPONENTE,
        entidadError: 'componente'
      });

      if (componenteExistente) return componenteExistente;

      const componente: Componente = new Componente();
      componente.nombre = dto.nombre;

      const newComponente: Componente = qR
        ? await qR.manager.save(Componente, componente)
        : await this.componenteRepository.save(componente);

      return newComponente;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Componente, DtoComponenteEditar, typeof Entidad.COMPONENTE>): Promise<UpdateRetorno<Componente>> {
    try {
      const componente: Componente = await this.getDatoByIdOrFail({
        id,
        qR,
        relaciones,
        selected,
        entidadError
      });

      if (componente.nombre === dto.nombre) return { dato: componente, isQr: false };
      componente.nombre = dto.nombre || componente.nombre;

      const newComponente: Componente = qR
        ? await qR.manager.save(Componente, componente)
        : await this.componenteRepository.save(componente);

      return { dato: newComponente, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de componente`)
    }
  }

  async buscarComponenteNombre({ busqueda, limite = 20, offset = 0, qR }: BusquedaGenericoProp): Promise<RetornoGenericoServiceGet<DtoComponenteRespuesta>> {
    try {
      const criterio: FindManyOptions = {
        relations: [],
        where: {
          nombre: ILike(`%${busqueda}%`)
        },
        take: limite ?? 20,
        skip: offset ?? 0
      }

      const [datos, total] = await qR.manager.findAndCount(Componente, criterio);

      return {
        total,
        datos: datos.map((pe) => this.remplaceToReturn(pe))
      }
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar la busqueda de ${busqueda}`);
    }
  }

  public remplaceToReturn(entidad: Componente): DtoComponenteRespuesta {
    const base: DtoBaseRetorno = this.remplaceToBase(entidad);
    return {
      ...base,

      nombre: entidad.nombre
    }
  }
}
