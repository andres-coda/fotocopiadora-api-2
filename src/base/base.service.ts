import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityTarget, FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { Base } from './entity/base.entity';
import { CreateDefaultProp, CreateElementoControllerProp, CreateProp, CriterioProp, DeletProp, EditarElementoControllerProp, EditarProp, GetDatoProp, GetIdProp, GetIdsProp, GetNombresProp, GetProp, RelationsKey, SelectedDeep, UpdateRetorno } from './interface/base.interface';
import { EntidadDatoMapType, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { BaseDto } from './dto/baseDto';
import { BASE_RELATIONS, mergeNestedRelations, mergeRelationsBase, mergeSimpleRelations, relacionesAString } from '../utils/relacion';
import { QueryRunner } from 'typeorm/browser';
import { DtoBaseRetorno } from './dto/baseRetorno.dto';

@Injectable()
export abstract class BaseService<
  K extends keyof EntidadDatoMapType,
  T extends Base,
  CrearDto extends BaseDto,
  EditarDto extends BaseDto
> {
  protected constructor(
    protected readonly baseRepository: Repository<T>,
    protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gateway: GatewayGateway,
  ) { }


  /**
   * Crea un nuevo dato que extiende de Base.
   * La implementación concreta queda a cargo del servicio que herede.
   * @param params - Parámetros necesarios para crear el dato, incluyendo usuario, DTO, QueryRunner y entidad.
   * @returns Una promesa que resuelve al dato creado.
   */
  abstract createDato({ usuario, dto, qR, entidad }: CreateProp<CrearDto, K>): Promise<T>;

  /**
   * Actualiza un dato existente que extiende de Base.
   * La implementación concreta queda a cargo del servicio que herede.
   * @param params - Parámetros necesarios para actualizar el dato, incluyendo usuarioId, DTO, QueryRunner, id, entidadError, relaciones y selected.
   * @returns Una promesa que resuelve a un objeto UpdateRetorno con el dato actualizado.
   */
  abstract updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected }: EditarProp<T, EditarDto, K>): Promise<UpdateRetorno<T>>;

  abstract remplaceToReturn(entidad: T): EntidadDatoMapType[K];

  protected remplaceToBase(entidad: T): DtoBaseRetorno {
    return {
      id: entidad.id,
      fechaCreacion: entidad.fechaCreacion,
      fechaActualizacion: entidad.fechaActualizacion,
      deleted: entidad.deleted,
    }
  }

  /**
   * Realiza un merge profundo de objetos SelectedDeep.
   * Las propiedades definidas en override tienen prioridad sobre base.
   * Se utiliza principalmente para garantizar selecciones mínimas requeridas
   * (por ejemplo user.id) sin perder selecciones personalizadas.
   * @param base - El objeto base de selección.
   * @param override - El objeto override de selección.
   * @returns El objeto merged resultante.
   */
  protected mergeSelected<T>(
      base: SelectedDeep<T> | undefined,
      override: SelectedDeep<T>
    ): SelectedDeep<T> {
    if (!base) return override;

    const result: any = { ...base };

    for (const key in override) {
      const baseValue = base[key];
      const overrideValue = override[key];

      if (
        typeof baseValue === 'object' &&
        baseValue !== null &&
        typeof overrideValue === 'object' &&
        overrideValue !== null
      ) {
        // Ambos son objetos, hacer merge recursivo
        result[key] = this.mergeSelected(baseValue as any, overrideValue as any);
      } else {
        // Uno es true o el override prevalece
        result[key] = overrideValue;
      }
    }

    return result;
  }

  /**
   * Combina relaciones base con relaciones adicionales proporcionadas por el llamador.
   * Permite recibir una única definición de relaciones o un arreglo de ellas y
   * devuelve una única estructura de relaciones unificada.
   *
   * - Si no se recibe ninguna relación ni base ni adicional, retorna las relaciones
   *   base por defecto.
   * - Si solo se recibe la relación base, la retorna sin modificaciones.
   * - Si se reciben relaciones adicionales, estas se mergean con la relación base,
   *   unificando tanto las relaciones simples como las relaciones anidadas.
   *
   * No realiza validaciones sobre la existencia de las relaciones en la entidad;
   * asume que las relaciones recibidas son válidas.
   * @param input - Relaciones adicionales a mergear.
   * @param relacionBase - Relación base opcional.
   * @returns Un arreglo de relaciones merged.
   */
  protected mergeRelations<T extends Base>(
    input?: RelationsKey<T> | readonly RelationsKey<T>[],
    relacionBase?: RelationsKey<T>
  ): RelationsKey<T>[] {
    if (!relacionBase && !input) return [BASE_RELATIONS];


    // Si no hay input, retornar BASE_RELATIONS
    if (!input && relacionBase) return [relacionBase];

    // Si input es un array, mergear cada elemento
    const inputArray = Array.isArray(input) ? input : [input];

    let mergedRelations = relacionBase?.relations || [];
    let mergedNestedRelations = relacionBase?.nestedRelations;

    for (const item of inputArray) {
      // Mergear relations simples
      mergedRelations = mergeSimpleRelations(mergedRelations, item.relations);

      // Mergear nestedRelations
      mergedNestedRelations = mergeNestedRelations(mergedNestedRelations, item.nestedRelations);
    }

    return [{
      relations: mergedRelations,
      nestedRelations: mergedNestedRelations
    }];
  }

  /**
   * Construye un criterio base de búsqueda para entidades.
   * Permite definir relaciones, selección de campos, orden y filtrado por usuario.
   * Es reutilizado tanto para búsquedas simples como múltiples.
   * @param params - Parámetros para construir el criterio.
   * @returns El criterio construido para FindOneOptions o FindManyOptions.
   */
  protected crearCriterio<TOptions extends FindOneOptions | FindManyOptions>(
    { relaciones, selected, orden, where, usuarioId, relacionBase, selectedBase }: CriterioProp<T>
  ): TOptions {
    const mergeRelaciones = mergeRelationsBase(this.mergeRelations<T>(relaciones, relacionBase));
    const selectedBaseObservaciones: SelectedDeep<T> = this.mergeSelected(
      selectedBase, { user: { id: true }, } as unknown as SelectedDeep<T>
    );

    const finalSelected = selected
      ? this.mergeSelected(selected, selectedBaseObservaciones)
      : selectedBase;

    if (usuarioId) {
      where.user = { id: usuarioId };
    }

    const relationStrings = relacionesAString(mergeRelaciones);

    // Si hay relaciones anidadas (contienen puntos), no usar select para evitar conflictos con TypeORM
    const hasNestedRelations = relationStrings.some((r: string) => r.includes('.'));

    return {
      relations: relationStrings,
      ...(finalSelected && { select: finalSelected }),
      where,
      ...(orden && { order: { [orden]: 'ASC' } }),
    } as TOptions;
  }


  /**
   * Obtiene todos los datos activos (no eliminados) asociados a un usuario.
   * Permite definir relaciones, orden y selección de campos.
   * Si se recibe un QueryRunner, la consulta se ejecuta dentro de la transacción.
   * @param params - Parámetros para la consulta.
   * @returns Una promesa que resuelve a un arreglo de datos.
   */
  async getDato({ qR, relaciones = [], entidadError = undefined, usuarioId = '', orden = undefined, selected = undefined }: GetProp<T>): Promise<T[]> {
    try {
      const criterio: FindManyOptions = this.crearCriterio<FindManyOptions>({
        relaciones,
        selected,
        usuarioId,
        where: { deleted: false },
        orden,
      });

      if (qR) {
        const target: EntityTarget<T> = this.baseRepository.target;
        return await qR.manager.find<T>(target, criterio);
      }

      const dato: T[] = await this.baseRepository.find(criterio);
      return dato;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer los datos ${entidadError && `de ${entidadError}`}`)
    }
  }

  /**
   * Obtiene todos los datos asociados a un usuario, incluyendo los eliminados.
   * No aplica el filtro deleted = false.
   * Permite definir relaciones, orden y selección de campos.
   * Soporta ejecución dentro de una transacción mediante QueryRunner.
   * @param params - Parámetros para la consulta.
   * @returns Una promesa que resuelve a un arreglo de datos.
   */
  async getDatoTodos({ qR, relaciones = [], entidadError, usuarioId, orden = undefined, selected }: GetProp<T>): Promise<T[]> {
    try {
      const criterio: FindManyOptions = this.crearCriterio<FindManyOptions>({
        relaciones,
        selected,
        where: {},
        orden,
        usuarioId,
      });
      if (qR) {
        const target: EntityTarget<T> = this.baseRepository.target;
        return await qR.manager.find<T>(target, criterio);
      }

      return await this.baseRepository.find(criterio);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer los datos ${entidadError && `de ${entidadError}`}`)
    }
  }

  /**
   * Obtiene múltiples datos a partir de un arreglo de ids.
   * Cada dato se valida individualmente utilizando getDatoByIdOrFail.
   * Lanza excepción si alguno de los ids no existe o está eliminado.
   * @param params - Parámetros incluyendo ids, entidadError, relaciones, qR, usuarioId y selected.
   * @returns Una promesa que resuelve a un arreglo de datos.
   */
  async getDatosByIds({ ids, entidadError, relaciones, qR, usuarioId, selected }: GetIdsProp<T>): Promise<T[]> {
    try {
      const datos: T[] = await Promise.all(
        ids.map(id =>
          this.getDatoByIdOrFail({ id, qR, relaciones, entidadError, usuarioId, selected })
        )
      );
      return datos;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer los datos ${entidadError && `de ${entidadError}`}`)
    }
  }

  /**
   * Obtiene un dato por id.
   * Si no existe o se encuentra eliminado, lanza una excepción.
   * @param params - Parámetros incluyendo id, qR, relaciones, entidadError, usuarioId y selected.
   * @returns Una promesa que resuelve al dato encontrado.
   */
  async getDatoByIdOrFail({ id, qR, relaciones, entidadError, usuarioId, selected }: GetIdProp<T>): Promise<T> {
    try {
      const dato: T | null = await this.getDatoById({ id, qR, relaciones, entidadError, usuarioId, selected });
      if (!dato) throw new NotFoundException(`No se encontro el ${entidadError ? entidadError : 'dato'} en la base de datos`);
      if (dato.deleted) throw new NotFoundException(`El ${entidadError ? entidadError : 'dato'} ha sido eliminado con anterioridad`);
      return dato;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el dato con id ${id} ${entidadError && `de ${entidadError}`}`)
    }
  }

  /**
   * Obtiene un dato por id sin validar su estado de eliminación.
   * Devuelve null si el dato no existe.
   * Permite definir relaciones, selección de campos y filtrado por usuario.
   * @param params - Parámetros incluyendo id, qR, relaciones, entidadError, usuarioId y selected.
   * @returns Una promesa que resuelve al dato encontrado o null.
   */
  async getDatoById({ id, qR, relaciones = [], entidadError, usuarioId, selected = undefined }: GetIdProp<T>): Promise<T | null> {
    try {
      const criterio: FindOneOptions = this.crearCriterio<FindOneOptions>({
        relaciones,
        selected,
        where: { id: id },
        usuarioId,
      });

      if (qR) {
        const target: EntityTarget<T> = this.baseRepository.target;
        return await qR.manager.findOne<T>(target, criterio);
      }

      return await this.baseRepository.findOne(criterio);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el dato con id ${id} ${entidadError && `de ${entidadError}`}`)
    }
  }

  /**
   * Obtiene un elemento a partir de su nombre.
   * Permite incluir relaciones y selección parcial de campos mediante los
   * parámetros recibidos.
   * Si se proporciona un QueryRunner, la consulta se ejecuta dentro de una
   * transacción activa; de lo contrario, se realiza directamente sobre
   * el repositorio.
   * Devuelve el elemento encontrado o null si no existe.
   * No lanza excepción cuando el dato no existe, únicamente ante errores
   * inesperados de acceso a datos.
   * @param params - Parámetros incluyendo dato (nombre), usuarioId, qR, relaciones, selected y entidadError.
   * @returns Una promesa que resuelve al dato encontrado o null.
   */
  async getDatoByName({ dato, usuarioId, qR, relaciones, selected, entidadError }: GetDatoProp<T>): Promise<T | null> {
    try {
      const criterio: FindOneOptions = this.crearCriterio<FindOneOptions>({
        relaciones,
        selected,
        where: { nombre: dato },
        usuarioId,
      });
      if (qR) {
        const target: EntityTarget<T> = this.baseRepository.target;
        return await qR.manager.findOne<T>(target, criterio);
      }

      return await this.baseRepository.findOne(criterio);

    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el dato con nombre ${dato} ${entidadError && `de ${entidadError}`}`)
    }
  }

  async getDatosByNombres({ nombres, usuarioId, qR, relaciones, selected, entidadError }: GetNombresProp<T>): Promise<T[]> {
    try {
      if (nombres.length == 0) return [];
      const criterio: FindManyOptions = this.crearCriterio<FindManyOptions>({
        relaciones,
        selected,
        where: { nombre: In(nombres) },
        usuarioId,
      });

      const target = this.baseRepository.target;

      const datos: T[] = qR
        ? await qR.manager.find(target, criterio)
        : await this.baseRepository.find(criterio)

      return datos;

    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer los nombres de ${entidadError && `de ${entidadError}`}`)
    }

  }

  /**
   * Realiza un borrado lógico del dato (deleted = true).
   * Valida la existencia previa del dato.
   * Emite un evento de actualización mediante gateway si no se ejecuta
   * dentro de una transacción.
   * @param params - Parámetros incluyendo id, qR, entidadError, entidad y usuarioId.
   * @returns Una promesa que resuelve a true si el borrado fue exitoso.
   */
  async softDelete({ id, qR, entidadError, entidad, usuarioId }: DeletProp<T, K>): Promise<boolean> {
    try {
      const dato: T = await this.getDatoByIdOrFail({ id, qR, entidadError, usuarioId });
      dato.deleted = true;

      const saved = qR
        ? await qR.manager.save<T>(dato)
        : await this.baseRepository.save(dato);

      if (!saved) throw new NotFoundException(`No se pudo eliminar el dato con id ${id}${entidadError ? ` de ${entidadError}` : ''}`);

      const payload: Mensaje = {
        mensaje: Mens.ELIMINAR,
        entidad: entidad,
        id: id
      }
      this.gateway.actualizacionDato(payload);

      return true;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error en softDeleted de Base`)
    }
  }

  // Revierte un borrado lógico (deleted = false).
  // Valida la existencia del dato antes de restaurarlo.
  // Emite un evento de actualización mediante gateway si no se ejecuta
  // dentro de una transacción.
  async undoDelete({ id, qR, entidadError, entidad, usuarioId }: DeletProp<T, K>): Promise<boolean> {
    try {
      const dato: T | null = await this.getDatoById({ id, qR, entidadError, usuarioId });
      if (!dato) throw new NotFoundException(`No existe dato con id ${id} en la base de datos`);

      dato.deleted = false;

      const saved = qR
        ? await qR.manager.save<T>(dato)
        : await this.baseRepository.save(dato);

      if (!saved) throw new NotFoundException(`No se pudo reactivar el dato con id ${id}${entidadError ? ` de ${entidadError}` : ''}`);

      const retorno:  EntidadDatoMapType[K] = this.remplaceToReturn(saved);
      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.REHACER,
          entidad: entidad,
          dato: retorno
        }
        this.gateway.actualizacionDato(payload);
      }

      return true;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error en undoDeleted de Base`)
    }
  }

  // Elimina físicamente el dato de la base de datos.
  // Esta operación es irreversible.
  // Emite un evento de actualización mediante gateway si no se ejecuta
  // dentro de una transacción.
  async delete({ id, qR, entidadError, entidad, usuarioId }: DeletProp<T, K>): Promise<boolean> {
    try {
      const dato: T = await this.getDatoByIdOrFail({ id, qR, entidadError, usuarioId });

      const saved = qR
        ? await qR.manager.remove<T>(dato)
        : await this.baseRepository.remove(dato);

      if (!saved) throw new NotFoundException(`No se pudo eliminar el dato con id ${id}${entidadError ? ` de ${entidadError}` : ''}`);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.ELIMINAR,
          entidad: entidad,
          id: id
        }
        this.gateway.actualizacionDato(payload);
      }

      return true;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error en softDeleted de Base`)
    }
  }

  // Método utilizado por los controladores para crear elementos.
  // Gestiona explícitamente la transacción mediante QueryRunner,
  // asegurando commit o rollback según el resultado de la operación.
  async createDatoCx({ usuario, dto, entidad }: CreateElementoControllerProp<CrearDto, K>): Promise< EntidadDatoMapType[K]> {
    const qR: QueryRunner = this.dataSource.createQueryRunner();
    await qR.connect();
    await qR.startTransaction();
    try {
      console.log('Antes de crear el elemento')
      const newElemento: T = await this.createDato({ usuario, dto, qR, entidad });
      console.log('Despues de crear el elemento')
      await qR.commitTransaction();
      console.log('New elemento: ', newElemento)

      const retorno:  EntidadDatoMapType[K] = this.remplaceToReturn(newElemento);
      const payload: Mensaje = {
        mensaje: Mens.CREAR,
        entidad: entidad,
        dato: retorno
      }
      this.gateway.actualizacionDato(payload);

      return retorno;
    } catch (er) {
      await qR.rollbackTransaction();
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el elemento en la entidad`)
    } finally {
      await qR.release();
    }
  }

  // Método utilizado por los controladores para editar elementos.
  // Gestiona explícitamente la transacción mediante QueryRunner
  // y asegura la consistencia del versionado.
  async updateElementoController({ usuario, dto, entidad, id, relaciones, selected, entidadError }: EditarElementoControllerProp<T, EditarDto, K>): Promise< EntidadDatoMapType[K]> {
    const qR: QueryRunner = this.dataSource.createQueryRunner();
    await qR.connect();
    await qR.startTransaction();
    try {
      const newElemento: UpdateRetorno<T> = await this.updateDato({ usuarioId: usuario.id, dto, qR, id, relaciones, selected, entidadError, entidad });

      if (!newElemento) throw new NotFoundException(`No se pudo actualizar el elemento ${id} en concepto`)
      await qR.commitTransaction();

      
      const retorno:EntidadDatoMapType[K] = this.remplaceToReturn(newElemento.dato);

      if (newElemento.isQr) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad: entidad,
          dato: retorno
        }
        this.gateway.actualizacionDato(payload);
      }

      
      return retorno;
    } catch (er) {
      await qR.rollbackTransaction();
      throw this.erroresService.handleExceptions(er, `Error al intentar actualizar el elemento en la entidad ${entidad}`)
    } finally {
      await qR.release();
    }
  }

  async createElementoDefault({ usuario, qR, entidad, defecto, entidadError }: CreateDefaultProp<K, CrearDto>): Promise<T[]> {
    try {
      const defaults: T[] = await Promise.all(
        defecto.map(d =>
          this.createDato({ usuario, qR, dto: d, entidad })
        )
      );
      return defaults;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear ${entidadError} por defecto`)
    }
  }

  async getDatoCx({ qR, relaciones = [], entidadError = undefined, usuarioId = '', orden = undefined, selected = undefined }: GetProp<T>): Promise<EntidadDatoMapType[K][]>{
    try{
      const datos: T[] = await this.getDato({qR, usuarioId, entidadError, relaciones, orden, selected});
      const retorno: EntidadDatoMapType[K][] = datos.map(d => this.remplaceToReturn(d));
      return retorno;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer todos los  ${entidadError} de la base de datos`)
    }
  }

  async getDatoByIdCx({ id, qR, relaciones, entidadError, usuarioId, selected }: GetIdProp<T>): Promise<EntidadDatoMapType[K]>{
    try{
      const dato: T = await this.getDatoByIdOrFail({qR, usuarioId, entidadError, relaciones, id, selected});
      const retorno: EntidadDatoMapType[K] = this.remplaceToReturn(dato);
      return retorno;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer todos los  ${entidadError} de la base de datos`)
    }
  }
}

