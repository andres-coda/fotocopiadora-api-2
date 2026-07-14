import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityTarget, FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { Base } from './entity/base.entity';
import { CreateDefaultProp, CreateProp, CriterioProp, DeletProp, EditarProp, GetDatoProp, GetIdProp, GetIdsProp, GetNombresProp, GetProp, RelationsKey, RetornoGet, SelectedDeep, UpdateRetorno } from './interface/base.interface';
import { EntidadDatoMapType, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { BaseDto } from './dto/baseDto';
import { BASE_RELATIONS, mergeNestedRelations, mergeRelationsBase, mergeSimpleRelations, relacionesAString } from '../utils/relacion';
import { DtoBaseRetorno } from './dto/baseRetorno.dto';
import { GetGenericoProp } from '@src/interface/general.interface';

/**
 * Servicio base genérico para todas las entidades del sistema.
 *
 * Cambios respecto a la versión anterior (MySQL):
 *
 * 1. Se eliminó `usuarioId` de todas las props.
 *    El filtrado por empresa/usuario lo realiza el Row-Level Security
 *    de PostgreSQL automáticamente. No es necesario pasarlo en cada query.
 *
 * 2. `createDatoCx` y `updateElementoController` ya NO crean su propio
 *    QueryRunner. Reciben el qR inyectado por DbContextInterceptor, que
 *    ya tiene la transacción abierta y el GUC seteado.
 *    El commit/rollback lo maneja el interceptor.
 *
 * 3. `crearCriterio` ya no agrega `where.user = { id: usuarioId }`.
 *    PostgreSQL aplica RLS automáticamente en cada query.
 *
 * 4. Los métodos que antes creaban su propia transacción (createDatoCx,
 *    updateElementoController) ahora delegan ese manejo al interceptor.
 */

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
   * @param params - Parámetros necesarios para crear el dato, DTO, QueryRunner y entidad.
   * @returns Una promesa que resuelve al dato creado.
   */
  abstract createDato({ dto, qR, entidad }: CreateProp<CrearDto, K>): Promise<T>;

  /**
   * Actualiza un dato existente que extiende de Base.
   * La implementación concreta queda a cargo del servicio que herede.
   * @param params - Parámetros necesarios para actualizar el dato, DTO, QueryRunner, id, entidadError, relaciones y selected.
   * @returns Una promesa que resuelve a un objeto UpdateRetorno con el dato actualizado.
   */
  abstract updateDato({ dto, qR, id, entidadError, relaciones, selected }: EditarProp<T, EditarDto, K>): Promise<UpdateRetorno<T>>;

  abstract remplaceToReturn(entidad: T): EntidadDatoMapType[K] | undefined;

  protected remplaceToBase(entidad: T): DtoBaseRetorno {
    return {
      id: entidad.id,
      fechaCreacion: entidad.fechaCreacion,
      fechaActualizacion: entidad.fechaActualizacion,
      deleted: entidad.deleted ?? false,
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
   * Permite definir relaciones, selección de campos, orden.
   * Es reutilizado tanto para búsquedas simples como múltiples.
   * @param params - Parámetros para construir el criterio.
   * @returns El criterio construido para FindOneOptions o FindManyOptions.
   */
  protected crearCriterio<TOptions extends FindOneOptions | FindManyOptions>(
    { relaciones, selected, orden, where, relacionBase, selectedBase, limite, offset }: CriterioProp<T>
  ): TOptions {
    const mergeRelaciones = mergeRelationsBase(this.mergeRelations<T>(relaciones, relacionBase));
    const selectedBaseObservaciones: SelectedDeep<T> = this.mergeSelected(
      selectedBase,{} as unknown as SelectedDeep<T>
    );

    const finalSelected = selected
      ? this.mergeSelected(selected, selectedBaseObservaciones)
      : selectedBase;

    const relationStrings = relacionesAString(mergeRelaciones);

    // Si hay relaciones anidadas (contienen puntos), no usar select para evitar conflictos con TypeORM
    const hasNestedRelations = relationStrings.some((r: string) => r.includes('.'));

    return {
      relations: relationStrings,
      ...(finalSelected && { select: finalSelected }),
      where,
      ...(orden && { order: { [orden]: 'ASC' } }),
      take: limite ?? 50,
      skip: offset ?? 0,
    } as TOptions;
  }


  /**
   * Obtiene todos los datos activos (no eliminados) asociados a una empresa.
   * Permite definir relaciones, orden y selección de campos.
   * Si se recibe un QueryRunner, la consulta se ejecuta dentro de la transacción.
   * @param params - Parámetros para la consulta.
   * @returns Una promesa que resuelve a un arreglo de datos.
   */
  async getDato({ qR, relaciones = [], entidadError = undefined, orden = undefined, selected = undefined, limite, offset }: GetProp<T>): Promise<{ datos: T[], total: number }> {
    try {
      const criterio: FindManyOptions = this.crearCriterio<FindManyOptions>({
        relaciones,
        selected,
        where: { deleted: false },
        orden,
      });

      if (qR) {
        const target: EntityTarget<T> = this.baseRepository.target;
        const [datos, total] = await qR.manager.findAndCount<T>(target, criterio);
        return {
          datos, total
        }
      }

      const [datos, total] = await this.baseRepository.findAndCount(criterio);
      return { datos, total };
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
  async getDatoTodos({ qR, relaciones = [], entidadError, orden = undefined, selected, limite, offset }: GetProp<T>): Promise<{ datos: T[], total: number }> {
    try {
      const criterio: FindManyOptions = this.crearCriterio<FindManyOptions>({
        relaciones,
        selected,
        where: {},
        orden,
        limite,
        offset
      });
      if (qR) {
        const target: EntityTarget<T> = this.baseRepository.target;
        const [datos, total] = await qR.manager.findAndCount<T>(target, criterio);
        return { datos, total };
      }

      const [datos, total] = await this.baseRepository.findAndCount(criterio);
      return { datos, total };
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer los datos ${entidadError && `de ${entidadError}`}`)
    }
  }

  /**
   * Obtiene múltiples datos a partir de un arreglo de ids.
   * Cada dato se valida individualmente utilizando getDatoByIdOrFail.
   * Lanza excepción si alguno de los ids no existe o está eliminado.
   * @param params - Parámetros incluyendo ids, entidadError, relaciones, qR y selected.
   * @returns Una promesa que resuelve a un arreglo de datos.
   */
  async getDatosByIds({ ids, entidadError, relaciones, qR, selected }: GetIdsProp<T>): Promise<T[]> {
    try {
      const datos: T[] = await Promise.all(
        ids.map(id =>
          this.getDatoByIdOrFail({ id, qR, relaciones, entidadError, selected })
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
   * @param params - Parámetros incluyendo id, qR, relaciones, entidadError y selected.
   * @returns Una promesa que resuelve al dato encontrado.
   */
  async getDatoByIdOrFail({ id, qR, relaciones, entidadError, selected }: GetIdProp<T>): Promise<T> {
    try {
      const dato: T | null = await this.getDatoById({ id, qR, relaciones, entidadError, selected });
      if (!dato) throw new NotFoundException(`No se encontro el ${entidadError ? entidadError : 'dato'} en la base de datos`);
      if (dato.deleted) throw new NotFoundException(`El dato de ${entidadError ? entidadError : 'dato'} ha sido eliminado con anterioridad`);
      return dato;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el dato con id ${id} ${entidadError && `de ${entidadError}`}`)
    }
  }

  /**
   * Obtiene un dato por id sin validar su estado de eliminación.
   * Devuelve null si el dato no existe.
   * Permite definir relaciones, selección de campos.
   * @param params - Parámetros incluyendo id, qR, relaciones, entidadError y selected.
   * @returns Una promesa que resuelve al dato encontrado o null.
   */
  async getDatoById({ id, qR, relaciones = [], entidadError, selected = undefined }: GetIdProp<T>): Promise<T | null> {
    try {
      const criterio: FindOneOptions = this.crearCriterio<FindOneOptions>({
        relaciones,
        selected,
        where: { id: id },
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
   * @param params - Parámetros incluyendo dato (nombre), qR, relaciones, selected y entidadError.
   * @returns Una promesa que resuelve al dato encontrado o null.
   */
  async getDatoByName({ dato, qR, relaciones, selected, entidadError }: GetDatoProp<T>): Promise<T | null> {
    try {
      const criterio: FindOneOptions = this.crearCriterio<FindOneOptions>({
        relaciones,
        selected,
        where: { nombre: dato },
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

  async getDatosByNombres({ nombres, qR, relaciones, selected, entidadError }: GetNombresProp<T>): Promise<T[]> {
    try {
      if (nombres.length == 0) return [];
      const criterio: FindManyOptions = this.crearCriterio<FindManyOptions>({
        relaciones,
        selected,
        where: { nombre: In(nombres) },
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
   * @param params - Parámetros incluyendo id, qR, entidadError, entidad.
   * @returns Una promesa que resuelve a true si el borrado fue exitoso.
   */
  async softDelete({ id, qR, entidadError, entidad }: DeletProp<T, K>): Promise<boolean> {
    try {
      const dato: T = await this.getDatoByIdOrFail({ id, qR, entidadError });
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
  async undoDelete({ id, qR, entidadError, entidad }: DeletProp<T, K>): Promise<boolean> {
    try {
      const dato: T | null = await this.getDatoById({ id, qR, entidadError });
      if (!dato) throw new NotFoundException(`No existe dato con id ${id} en la base de datos`);

      dato.deleted = false;

      const saved = qR
        ? await qR.manager.save<T>(dato)
        : await this.baseRepository.save(dato);

      if (!saved) throw new NotFoundException(`No se pudo reactivar el dato con id ${id}${entidadError ? ` de ${entidadError}` : ''}`);

      const retorno: EntidadDatoMapType[K] | undefined= this.remplaceToReturn(saved);
      if(!retorno)  throw new NotFoundException(`No se pudo reactivar el dato con id ${id}${entidadError ? ` de ${entidadError}` : ''}`);
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
  async delete({ id, qR, entidadError, entidad }: DeletProp<T, K>): Promise<boolean> {
    try {
      const dato: T = await this.getDatoByIdOrFail({ id, qR, entidadError });

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

  /**
  * Crea un elemento usando el QueryRunner del interceptor.
  *
  * CAMBIO IMPORTANTE: ya no crea su propio QueryRunner ni hace commit/rollback.
  * Recibe el qR inyectado por DbContextInterceptor que ya tiene:
  * - La transacción abierta
  * - El GUC app.user_id seteado (para que RLS funcione)
  * El commit/rollback lo maneja el interceptor al terminar el request.
  */

  // Método utilizado por los controladores para crear elementos.
  // Gestiona explícitamente la transacción mediante QueryRunner,
  // asegurando commit o rollback según el resultado de la operación.
  async createDatoCx({ dto, entidad, qR }: CreateProp<CrearDto, K>): Promise<EntidadDatoMapType[K]> {
    try {
      const newElemento: T = await this.createDato({ dto, qR, entidad });
      const retorno: EntidadDatoMapType[K] | undefined= this.remplaceToReturn(newElemento);
      if(!retorno)  throw new NotFoundException(`No se pudo crear el dato`);

      this.gateway.actualizacionDato({
        mensaje: Mens.CREAR,
        entidad,
        dato: retorno,
      } as Mensaje);

      return retorno;
    } catch (error) {
      throw this.erroresService.handleExceptions(
        error,
        `Error al intentar crear el elemento en la entidad`,
      );
    }
  }

  /**
   * Actualiza un elemento usando el QueryRunner del interceptor.
   *
   * CAMBIO IMPORTANTE: igual que createDatoCx, delega el manejo
   * de la transacción al interceptor. No hace commit/rollback propio.
   */

  // Método utilizado por los controladores para editar elementos.
  // Gestiona explícitamente la transacción mediante QueryRunner
  // y asegura la consistencia del versionado.
  async updateElementoController({ dto, entidad, id, relaciones, selected, entidadError, qR }: EditarProp<T, EditarDto, K>): Promise<EntidadDatoMapType[K]> {
    try {
      const newElemento: UpdateRetorno<T> = await this.updateDato({
        dto,
        qR,
        id,
        relaciones,
        selected,
        entidadError,
        entidad,
      });

      if (!newElemento)
        throw new NotFoundException(`No se pudo actualizar el elemento ${id}`);

      const retorno: EntidadDatoMapType[K] | undefined= this.remplaceToReturn(newElemento.dato);

      if(!retorno)  throw new NotFoundException(`No se pudo editar el dato con id ${id}${entidadError ? ` de ${entidadError}` : ''}`);

      if (newElemento.isQr) {
        this.gateway.actualizacionDato({
          mensaje: Mens.EDITAR,
          entidad,
          dato: retorno,
        } as Mensaje);
      }

      return retorno;
    } catch (error) {
      throw this.erroresService.handleExceptions(
        error,
        `Error al intentar actualizar el elemento en la entidad ${entidad}`,
      );
    }
  }

  async createElementoDefault({ qR, entidad, defecto, entidadError }: CreateDefaultProp<K, CrearDto>): Promise<T[]> {
    try {
      const defaults: T[] = await Promise.all(
        defecto.map(d =>
          this.createDato({ qR, dto: d, entidad })
        )
      );
      return defaults;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear ${entidadError} por defecto`)
    }
  }

  async getDatoCx({ qR, relaciones = [], entidadError = undefined, orden = undefined, selected = undefined, limite = 50, offset = 0 }: GetProp<T>): Promise<RetornoGet<K>> {
    try {
      const find: { datos: T[], total: number } = await this.getDato({ qR, entidadError, relaciones, orden, selected, limite, offset });

      const retorno: EntidadDatoMapType[K][]= (find.datos?? [] ) .flatMap(e => {
            const esp = this.remplaceToReturn(e);
            return esp ? [esp] : [];
          });
      
      return {
        total: find.total,
        limite: limite,
        pagina: offset + 1,
        datos: retorno,
      };
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer todos los  ${entidadError} de la base de datos`)
    }
  }

  async getDatoByIdCx({ id, qR, relaciones, entidadError, selected }: GetIdProp<T>): Promise<EntidadDatoMapType[K]> {
    try {
      const dato: T = await this.getDatoByIdOrFail({ qR, entidadError, relaciones, id, selected });
      const retorno: EntidadDatoMapType[K] | undefined= this.remplaceToReturn(dato);
      if(!retorno)  throw new NotFoundException(`No se encontro el dato ${id} que busacaba`);
      return retorno;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer todos los  ${entidadError} de la base de datos`)
    }
  }
}

