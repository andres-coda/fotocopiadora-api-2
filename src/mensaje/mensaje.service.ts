import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { BusquedaGenericoProp, GetGenericoProp, RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { Mensaje } from './entity/mensaje.entity';
import { DtoMensajeCrear } from './dto/mensajeCrear.dto';
import { DtoMensajeEditar } from './dto/mensajeEditar.dto';
import { MensajeRetorno } from './retorno/mensaje.retorno';

interface MensajeFila {
  id: string;
  id_empresa: string;
  nombre: string;
  mensaje: string | null;
  favorito: boolean;
}

/**
 * El favorito ahora es por usuario: se resuelve con un LEFT JOIN contra
 * usuario_mensaje_fav filtrando por fc_usuario_actual(). No se depende solo
 * del RLS: el join explicito funciona aunque una tabla tenga el RLS apagado.
 */
const SELECT_MENSAJE_CON_FAVORITO = `
  select m.id, m.id_empresa, m.nombre, m.mensaje,
         (f.id_mensaje is not null) as favorito
    from mensaje m
    left join usuario_mensaje_fav f
      on f.id_mensaje = m.id
     and f.id_usuario = fc_usuario_actual()
`;

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
   * Los favoritos del usuario autenticado van primero.
   */
  async getMensajes({ qR, limite, offset }: GetGenericoProp): Promise<RetornoGenericoServiceGet<MensajeRetorno>> {
    try {
      const datos: MensajeFila[] = await qR.manager.query(
        `${SELECT_MENSAJE_CON_FAVORITO}
          order by favorito desc, m.nombre asc
          limit $1 offset $2`,
        [limite ?? 20, offset ?? 0],
      );

      const total: number = await this.contarMensajes(qR);

      return {
        total,
        datos: datos.map((d) => this.toRetornoFila(d)),
      };
    } catch (error) {
      throw this.erroresService.handleExceptions(error, 'Error al intentar leer los mensajes');
    }
  }

  /**
   * Busqueda paginada de mensajes por nombre (ILIKE).
   * Los favoritos del usuario autenticado van primero.
   */
  async buscarMensajeNombre({ busqueda, limite = 20, offset = 0, qR }: BusquedaGenericoProp): Promise<RetornoGenericoServiceGet<MensajeRetorno>> {
    try {
      const patron = `%${busqueda}%`;

      const datos: MensajeFila[] = await qR.manager.query(
        `${SELECT_MENSAJE_CON_FAVORITO}
          where m.nombre ilike $1
          order by favorito desc, m.nombre asc
          limit $2 offset $3`,
        [patron, limite, offset],
      );

      const total: number = await this.contarMensajes(qR, patron);

      return {
        total,
        datos: datos.map((d) => this.toRetornoFila(d)),
      };
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar la busqueda de ${busqueda}`);
    }
  }

  async getMensajeByIdOrFail(qR: QueryRunner, id: string): Promise<MensajeRetorno> {
    try {
      const dato: Mensaje = await this.getEntityByIdOrFail(qR, id);

      return this.toRetorno(dato, await this.esFavorito(qR, id));
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

      return this.toRetorno(newMensaje, false);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar crear el mensaje ${dto.nombre}`);
    }
  }

  async updateMensaje(qR: QueryRunner, id: string, dto: DtoMensajeEditar): Promise<MensajeRetorno> {
    try {
      const mensaje: Mensaje = await this.getEntityByIdOrFail(qR, id);

      if (dto.nombre !== undefined) mensaje.nombre = dto.nombre;
      if (dto.mensaje !== undefined) mensaje.mensaje = dto.mensaje;

      const newMensaje: Mensaje = await qR.manager.save(Mensaje, mensaje);

      return this.toRetorno(newMensaje, await this.esFavorito(qR, id));
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar editar el mensaje ${id}`);
    }
  }

  /**
   * Marca o desmarca el mensaje como favorito del usuario autenticado.
   * El id_usuario lo resuelve el DEFAULT fc_usuario_actual() al insertar.
   */
  async setFavorito(qR: QueryRunner, id: string, favorito: boolean): Promise<MensajeRetorno> {
    try {
      await this.getEntityByIdOrFail(qR, id);

      if (favorito) {
        await qR.manager.query(
          `insert into usuario_mensaje_fav (id_mensaje)
           select $1::uuid
            where not exists (
              select 1
                from usuario_mensaje_fav
               where id_mensaje = $1
                 and id_usuario = fc_usuario_actual()
            )`,
          [id],
        );
      } else {
        await qR.manager.query(
          `delete from usuario_mensaje_fav
            where id_mensaje = $1
              and id_usuario = fc_usuario_actual()`,
          [id],
        );
      }

      return this.getMensajeByIdOrFail(qR, id);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar cambiar el favorito del mensaje ${id}`);
    }
  }

  /**
   * Borrado fisico: la tabla mensaje no tiene columna deleted.
   * usuario_mensaje_fav se limpia por ON DELETE CASCADE.
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

  private async contarMensajes(qR: QueryRunner, patron?: string): Promise<number> {
    const filas: { total: number }[] = patron
      ? await qR.manager.query(`select count(*)::int as total from mensaje where nombre ilike $1`, [patron])
      : await qR.manager.query(`select count(*)::int as total from mensaje`);

    return filas[0]?.total ?? 0;
  }

  private async esFavorito(qR: QueryRunner, idMensaje: string): Promise<boolean> {
    const filas: { favorito: boolean }[] = await qR.manager.query(
      `select exists(
         select 1
           from usuario_mensaje_fav
          where id_mensaje = $1
            and id_usuario = fc_usuario_actual()
       ) as favorito`,
      [idMensaje],
    );

    return filas[0]?.favorito ?? false;
  }

  private async getEntityByIdOrFail(qR: QueryRunner, id: string): Promise<Mensaje> {
    const criterio: FindOneOptions = {
      where: { id },
    };

    const dato: Mensaje | null = await qR.manager.findOne(Mensaje, criterio);
    if (!dato) throw new NotFoundException(`No se encontro el mensaje con id ${id}`);

    return dato;
  }

  private toRetorno(mensaje: Mensaje, favorito: boolean): MensajeRetorno {
    return new MensajeRetorno({
      id: mensaje.id,
      nombre: mensaje.nombre,
      mensaje: mensaje.mensaje,
      favorito,
    });
  }

  private toRetornoFila(fila: MensajeFila): MensajeRetorno {
    return new MensajeRetorno({
      id: fila.id,
      nombre: fila.nombre,
      mensaje: fila.mensaje,
      favorito: fila.favorito,
    });
  }
}
