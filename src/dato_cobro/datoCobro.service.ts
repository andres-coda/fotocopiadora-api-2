import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, ILike, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { BusquedaGenericoProp, GetGenericoProp, RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { DatoCobro } from './entity/datoCobro.entity';
import { DtoDatoCobroCrear } from './dto/datoCobroCrear.dto';
import { DtoDatoCobroEditar } from './dto/datoCobroEditar.dto';
import { DatoCobroRetorno } from './retorno/datoCobro.retorno';

/**
 * Servicio de datos de cobro de la empresa.
 *
 * No extiende BaseService porque DatoCobro no extiende Base:
 * la tabla dato_cobro no tiene fecha_creacion, fecha_actualizacion ni deleted.
 * Por eso las consultas se escriben a mano y el borrado es fisico.
 * El filtrado por empresa lo hace el RLS de PostgreSQL automaticamente.
 */
@Injectable()
export class DatoCobroService {
  constructor(
    @InjectRepository(DatoCobro)
    private readonly datoCobroRepository: Repository<DatoCobro>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly erroresService: ErroresService,
  ) { }

  /**
   * Listado paginado de datos de cobro de la empresa.
   * El RLS filtra automaticamente por id_empresa.
   */
  async getDatosCobro({ qR, limite, offset }: GetGenericoProp): Promise<RetornoGenericoServiceGet<DatoCobroRetorno>> {
    try {
      const criterio: FindManyOptions = {
        take: limite ?? 20,
        skip: offset ?? 0,
      };

      const [datos, total] = await qR.manager.findAndCount(DatoCobro, criterio);

      return {
        total,
        datos: datos.map((d) => this.toRetorno(d)),
      };
    } catch (error) {
      throw this.erroresService.handleExceptions(error, 'Error al intentar leer los datos de cobro');
    }
  }

  /**
   * Busqueda paginada de datos de cobro por nombre (ILIKE).
   * Reemplaza al listado sin paginar que alimentaba los desplegables del front.
   * El RLS filtra automaticamente por id_empresa.
   */
  async buscarDatoCobroNombre({ busqueda, limite = 20, offset = 0, qR }: BusquedaGenericoProp): Promise<RetornoGenericoServiceGet<DatoCobroRetorno>> {
    try {
      const criterio: FindManyOptions = {
        where: { nombre: ILike(`%${busqueda}%`) },
        take: limite ?? 20,
        skip: offset ?? 0,
        order: { nombre: 'ASC' },
      };

      const [datos, total] = await qR.manager.findAndCount(DatoCobro, criterio);

      return {
        total,
        datos: datos.map((d) => this.toRetorno(d)),
      };
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar la busqueda de ${busqueda}`);
    }
  }

  async getDatoCobroByIdOrFail(qR: QueryRunner, id: string): Promise<DatoCobroRetorno> {
    try {
      const dato: DatoCobro = await this.getEntityByIdOrFail(qR, id);

      return this.toRetorno(dato);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el dato de cobro con id ${id}`);
    }
  }

  /**
   * Crea un dato de cobro para la empresa actual.
   * id_empresa lo pasa el controller a partir del usuario autenticado,
   * porque la tabla dato_cobro no tiene DEFAULT para esa columna.
   */
  async createDatoCobro(qR: QueryRunner, dto: DtoDatoCobroCrear, idEmpresa?: string | null): Promise<DatoCobroRetorno> {
    try {
      const datoCobro: DatoCobro = new DatoCobro();
      datoCobro.nombre = dto.nombre;
      datoCobro.mensaje = dto.mensaje;
      if (idEmpresa) datoCobro.idEmpresa = idEmpresa;

      const newDatoCobro: DatoCobro = await qR.manager.save(DatoCobro, datoCobro);

      return this.toRetorno(newDatoCobro);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar crear el dato de cobro ${dto.nombre}`);
    }
  }

  async updateDatoCobro(qR: QueryRunner, id: string, dto: DtoDatoCobroEditar): Promise<DatoCobroRetorno> {
    try {
      const datoCobro: DatoCobro = await this.getEntityByIdOrFail(qR, id);

      if (dto.nombre !== undefined) datoCobro.nombre = dto.nombre;
      if (dto.mensaje !== undefined) datoCobro.mensaje = dto.mensaje;

      const newDatoCobro: DatoCobro = await qR.manager.save(DatoCobro, datoCobro);

      return this.toRetorno(newDatoCobro);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar editar el dato de cobro ${id}`);
    }
  }

  /**
   * Borrado fisico: la tabla dato_cobro no tiene columna deleted.
   */
  async deleteDatoCobro(qR: QueryRunner, id: string): Promise<boolean> {
    try {
      const datoCobro: DatoCobro = await this.getEntityByIdOrFail(qR, id);

      await qR.manager.remove(DatoCobro, datoCobro);

      return true;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar eliminar el dato de cobro ${id}`);
    }
  }

  private async getEntityByIdOrFail(qR: QueryRunner, id: string): Promise<DatoCobro> {
    const criterio: FindOneOptions = {
      where: { id },
    };

    const dato: DatoCobro | null = await qR.manager.findOne(DatoCobro, criterio);
    if (!dato) throw new NotFoundException(`No se encontro el dato de cobro con id ${id}`);

    return dato;
  }

  private toRetorno(datoCobro: DatoCobro): DatoCobroRetorno {
    return new DatoCobroRetorno({
      id: datoCobro.id,
      nombre: datoCobro.nombre,
      mensaje: datoCobro.mensaje,
    });
  }
}
