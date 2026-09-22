import { Injectable } from '@nestjs/common';
import { BaseService } from '@src/base/base.service';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Editorial } from './entity/editorial.entity';
import { DtoEditorialCrear, DtoEditorialEditar, DtoEditorialRespuesta } from './dto/editorial.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, ILike, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '@src/base/interface/base.interface';
import { BusquedaGenericoProp, RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { DtoBaseRetorno } from '@src/base/dto/baseRetorno.dto';
import { EDITORIAL_RELATIONS, SELECTED_EDITORIAL } from './default/editorial.default';

@Injectable()
export class EditorialService extends BaseService<typeof Entidad.EDITORIAL, Editorial, DtoEditorialCrear, DtoEditorialEditar> {
  constructor(
    @InjectRepository(Editorial) private readonly editorialRepository: Repository<Editorial>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(editorialRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ dto, qR, entidad }: CreateProp<DtoEditorialCrear, typeof Entidad.EDITORIAL>): Promise<Editorial> {
    try {
      const editorialExistente: Editorial | null = await this.getDatoByName({
        dato: dto.nombre,
        qR,
        relaciones: [EDITORIAL_RELATIONS],
        selected: SELECTED_EDITORIAL,
        entidadError: 'editorial'
      });

      if (editorialExistente) return editorialExistente;

      const editorial: Editorial = new Editorial();
      editorial.nombre = dto.nombre;

      const newEditorial: Editorial = qR
        ? await qR.manager.save(Editorial, editorial)
        : await this.editorialRepository.save(editorial);

      return newEditorial;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Editorial, DtoEditorialEditar, typeof Entidad.EDITORIAL>): Promise<UpdateRetorno<Editorial>> {
    try {
      const editorial: Editorial = await this.getDatoByIdOrFail({
        id,
        qR,
        relaciones,
        selected,
        entidadError
      });

      if (editorial.nombre === dto.nombre) return { dato: editorial, isQr: false };
      editorial.nombre = dto.nombre || editorial.nombre;

      const newEditorial: Editorial = qR
        ? await qR.manager.save(Editorial, editorial)
        : await this.editorialRepository.save(editorial);

      return { dato: newEditorial, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de editorial`)
    }
  }

  async buscarEditorialNombre({ busqueda, limite = 20, offset = 0, qR }: BusquedaGenericoProp): Promise<RetornoGenericoServiceGet<DtoEditorialRespuesta>> {
    try {
      const criterio: FindManyOptions = {
        relations: [],
        where: {
          nombre: ILike(`%${busqueda}%`)
        },
        take: limite ?? 20,
        skip: offset ?? 0
      }

      const [datos, total] = await qR.manager.findAndCount(Editorial, criterio);

      return {
        total,
        datos: datos.map((pe) => this.remplaceToReturn(pe))
      }
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar la busqueda de ${busqueda}`);
    }
  }

  public remplaceToReturn(entidad: Editorial): DtoEditorialRespuesta {
    const base: DtoBaseRetorno = this.remplaceToBase(entidad);
    return {
      ...base,

      nombre: entidad.nombre
    }
  }
}
