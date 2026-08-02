import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '@src/base/base.service';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { Empresa } from './entity/empresa.entity';
import { DtoEmpresaCrear, DtoEmpresaEditar, DtoEmpresaRespuesta } from './dto/empresa.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, QueryRunner, Repository } from 'typeorm';
import { DataSource } from 'typeorm/browser';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { EMPRESA_RELATIONS, EMPRESA_SELECTED } from './default/empresa.relacion';
import { CreateProp, EditarProp, UpdateRetorno } from '@src/base/interface/base.interface';
import { PrecioEmpresaService } from '@src/precio/precio_empresa.service';
import { PRECIO_DEFAULT } from '@src/precio/default/precio.default';

@Injectable()
export class EmpresaService extends BaseService<typeof Entidad.EMPRESA, Empresa, DtoEmpresaCrear, DtoEmpresaEditar> {
  constructor(
    @InjectRepository(Empresa) private readonly empresaRepository: Repository<Empresa>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    private readonly precioService: PrecioEmpresaService

  ) {
    super(empresaRepository, dataSource, erroresService, gatewayGateway)
  }

  /**
   * Búsqueda flexible de empresas usando fc_busqueda_empresa() de la BD.
   * Detecta automáticamente si la búsqueda es por nombre o teléfono.
   */
  async buscarEmpresas(
    busqueda: string,
    limite = 20,
    offset = 0,
    qR: QueryRunner,
  ): Promise<RetornoGenericoServiceGet<DtoEmpresaRespuesta>> {
    try {

      const criterio: FindManyOptions = this.crearCriterio<FindManyOptions>({
        relaciones: [EMPRESA_RELATIONS],
        selected: EMPRESA_SELECTED,
        where: { nombre: ILike(busqueda) },
        limite,
        offset      
      });

      const [datos, total] = await qR.manager.findAndCount(Empresa, criterio);
      return {
        total,
        datos: datos.map((r: Empresa) => this.remplaceToReturn(r)).filter(r=> r!= undefined),
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al buscar empresas`);
    }
  }

  async createDato({ dto, qR, entidad }: CreateProp<DtoEmpresaCrear, typeof Entidad.EMPRESA>): Promise<Empresa> {
    try {

      const empresa: Empresa = new Empresa();
      empresa.nombre = dto.nombre;
      empresa.telefono = dto.telefono;
      empresa.email = dto.email;

      const newEmpresa: Empresa = await qR.manager.save(Empresa, empresa);

      return newEmpresa;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear la empresa ${dto.nombre}`)
    }
  }

  async createDatoCx({ dto, entidad, qR }: CreateProp<DtoEmpresaCrear, typeof Entidad.EMPRESA>): Promise<DtoEmpresaRespuesta> {
    try {
      const newElemento: Empresa = await this.createDato({ dto, qR, entidad });
      
      const precios = await this.precioService.CreatePrecioDefault(PRECIO_DEFAULT, qR);
      
      const retorno = this.remplaceToReturn(newElemento);
      if(!retorno) throw new NotFoundException(`No se pudo crear la empresa ${dto.nombre}`);
      return retorno;
    } catch (error) {
      throw this.erroresService.handleExceptions(
        error,
        `Error al intentar crear la nueva empresa`,
      );
    }
  }

  async updateDato({ dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Empresa, DtoEmpresaEditar, typeof Entidad.EMPRESA>): Promise<UpdateRetorno<Empresa>> {
    try {
      const empresa: Empresa = await this.getDatoByIdOrFail({
        id,
        qR,
        entidadError,
        relaciones,
        selected
      });

      dto.telefono = dto.telefono?.trim() || undefined;
      dto.email = dto.email?.trim() || undefined;

      empresa.nombre = dto.nombre || empresa.nombre;
      empresa.telefono = dto.telefono || empresa.telefono;
      empresa.email = dto.email || empresa.email;

      const newEmpresa: Empresa = await qR.manager.save(Empresa, empresa);

      return { dato: newEmpresa, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.telefono || id} en el registro de empresas`)
    }
  }

  remplaceToReturn(entidad: Empresa): DtoEmpresaRespuesta | undefined{
    const base = this.remplaceToBase(entidad);
    if(!base) return undefined;
    return {
      ...base,
      nombre: entidad.nombre,
      telefono: entidad.telefono,
      email: entidad.email,
    };
  };
}
