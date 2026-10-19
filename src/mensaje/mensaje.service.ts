import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GetGenericoProp, RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { Mensaje } from './entity/mensaje.entity';
import { DtoMensajeCrear } from './dto/mensajeCrear.dto';
import { DtoMensajeEditar } from './dto/mensajeEditar.dto';
import { MensajeRetorno } from './retorno/mensaje.retorno';

/**
 * Servicio de mensajes de la empresa.
 *
 * No extiende BaseService porque Mensaje no extiende Base:
 * la tabla mensaje no tiene fecha_creacion, fecha_actualizacion ni deleted.
 * Por eso las consultas se escriben a mano y el borrado es fisico.
 * El filtrado por empresa lo hace el RLS de PostgreSQL automaticamente.
 */
@Injectable()
export class MensajeService {
  constructor(
    @InjectRepository(Mensaje)
    private readonly mensajeRepository: Repository<Mensaje>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly erroresService: ErroresService,
  ) { }

  /**
   * Listado paginado de mensajes de la empresa.
   * El RLS filtra automaticamente por id_empresa.
   */
  async getMensajes({ qR, limite, offset }: GetGenericoProp): Promise<RetornoGenericoServiceGet<MensajeRetorno>> {
    try {
      const criterio: FindManyOptions = {
        take: limite ?? 20,
        skip: offset ?? 0,
        order: {favorito: 'ASC'}
      };

      const [datos, total] = await qR.manager.findAndCount(Mensaje, criterio);

      return {
        total,
        datos: datos.map((d) => this.toRetorno(d)),
      };
    } catch (error) {
      throw this.erroresService.handleExceptions(error, 'Error al intentar leer los mensajes');
    }
  }

  /**
   * Devuelve todos los mensajes de la empresa, sin paginar.
   * Se usa para alimentar desplegables del front.
   */
  async getMensajesTodas(qR: QueryRunner): Promise<RetornoGenericoServiceGet<MensajeRetorno>> {
    try {
      const criterio: FindManyOptions = {
        order: { nombre: 'ASC' },
      };

      const [datos, total] = await qR.manager.findAndCount(Mensaje, criterio);

      return {
        total,
        datos: datos.map((d) => this.toRetorno(d)),
      };
    } catch (error) {
      throw this.erroresService.handleExceptions(error, 'Error al intentar leer todos los mensajes');
    }
  }

  async getMensajeByIdOrFail(qR: QueryRunner, id: string): Promise<MensajeRetorno> {
    try {
      const dato: Mensaje = await this.getEntityByIdOrFail(qR, id);

      return this.toRetorno(dato);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el mensaje con id ${id}`);
    }
  }

  /**
   * Crea un mensaje para la empresa actual.
   * id_empresa lo pasa el controller a partir del usuario autenticado,
   * porque la tabla mensaje no tiene DEFAULT para esa columna.
   */
  async createMensaje(qR: QueryRunner, dto: DtoMensajeCrear, idEmpresa?: string | null): Promise<MensajeRetorno> {
    try {
      const mensaje: Mensaje = new Mensaje();
      mensaje.nombre = dto.nombre;
      mensaje.mensaje = dto.mensaje;
      if (idEmpresa) mensaje.idEmpresa = idEmpresa;

      const newMensaje: Mensaje = await qR.manager.save(Mensaje, mensaje);

      return this.toRetorno(newMensaje);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar crear el mensaje ${dto.nombre}`);
    }
  }

  async updateMensaje(qR: QueryRunner, id: string, dto: DtoMensajeEditar): Promise<MensajeRetorno> {
    try {
      const mensaje: Mensaje = await this.getEntityByIdOrFail(qR, id);

      if (dto.nombre !== undefined) mensaje.nombre = dto.nombre;
      if (dto.mensaje !== undefined) mensaje.mensaje = dto.mensaje;
      if (dto.favorito !== undefined) mensaje.favorito = dto.favorito;

      const newMensaje: Mensaje = await qR.manager.save(Mensaje, mensaje);

      return this.toRetorno(newMensaje);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar editar el mensaje ${id}`);
    }
  }

  /**
   * Borrado fisico: la tabla mensaje no tiene columna deleted.
   */
  async deleteMensaje(qR: QueryRunner, id: string): Promise<boolean> {
    try {
      const mensaje: Mensaje = await this.getEntityByIdOrFail(qR, id);

      await qR.manager.remove(Mensaje, mensaje);

      return true;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar eliminar el mensaje ${id}`);
    }
  }

  private async getEntityByIdOrFail(qR: QueryRunner, id: string): Promise<Mensaje> {
    const criterio: FindOneOptions = {
      where: { id },
    };

    const dato: Mensaje | null = await qR.manager.findOne(Mensaje, criterio);
    if (!dato) throw new NotFoundException(`No se encontro el mensaje con id ${id}`);

    return dato;
  }

  private toRetorno(mensaje: Mensaje): MensajeRetorno {
    return new MensajeRetorno({
      id: mensaje.id,
      nombre: mensaje.nombre,
      mensaje: mensaje.mensaje,
      favorito: mensaje.favorito
    });
  }
}
