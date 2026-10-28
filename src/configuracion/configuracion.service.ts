import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { Configuracion } from './entity/configuracion.entity';
import { DtoConfiguracionEditar } from './dto/configuracionEditar.dto';
import { ConfiguracionRetorno } from './retorno/configuracion.retorno';
import { Sede } from '@src/sede/entity/sede.entity';
import { DatoCobro } from '@src/dato_cobro/entity/datoCobro.entity';
import { Mensaje } from '@src/mensaje/entity/mensaje.entity';

/**
 * Servicio de configuracion de la empresa.
 *
 * No extiende BaseService porque Configuracion no extiende Base:
 * la tabla configuraciones no tiene id, fecha_creacion ni deleted.
 * El filtro por empresa es EXPLICITO (idEmpresa del JWT): la PK es id_empresa
 * y hay una sola fila por empresa, asi que un find sin where devuelve la
 * primera fila de la tabla, o sea la configuracion de cualquier otra empresa.
 * El RLS queda como segunda capa, nunca como la unica.
 * La fila la crea el trigger de insercion de empresa: aca solo se lee y edita.
 */
@Injectable()
export class ConfiguracionService {
  constructor(
    @InjectRepository(Configuracion)
    private readonly configuracionRepository: Repository<Configuracion>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly erroresService: ErroresService,
  ) { }

  /**
   * Devuelve la configuracion de la empresa del usuario autenticado.
   * El filtro por idEmpresa es obligatorio: sin where, find devuelve la
   * primera fila de la tabla, que es la configuracion de otra empresa.
   */
  async getConfiguracionOrFail(qR: QueryRunner, idEmpresa?: string | null): Promise<ConfiguracionRetorno> {
    try {
      const dato: Configuracion = await this.getEntityOrFail(qR, idEmpresa);
      return this.toRetorno(dato);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, 'Error al intentar leer la configuracion de la empresa');
    }
  }

  /**
   * Edita la configuracion de la empresa actual.
   * Aplica solo los campos que vinieron definidos y setea fechaActualizacion
   * a mano, porque la tabla no tiene trigger de update que lo haga.
   * No crea ni borra: la fila la crea el trigger de la DB.
   */
  async updateConfiguracion(qR: QueryRunner, dto: DtoConfiguracionEditar, idEmpresa?: string | null): Promise<ConfiguracionRetorno> {
    try {
      const configuracion: Configuracion = await this.getEntityOrFail(qR, idEmpresa);

      if (dto.fechaEntrega !== undefined) configuracion.fechaEntrega = dto.fechaEntrega;
      if (dto.horaEntrega !== undefined) configuracion.horaEntrega = dto.horaEntrega;
      // El FK no se mapea como columna: se escribe asignando la relacion.
      if (dto.idSede !== undefined) configuracion.sede = { id: dto.idSede } as Sede;
      if (dto.idDatoCobro !== undefined) configuracion.datoCobro = { id: dto.idDatoCobro } as DatoCobro;
      if (dto.idMsjPedidoTomado !== undefined) configuracion.msjPedidoTomado = { id: dto.idMsjPedidoTomado } as Mensaje;
      if (dto.idMsjPedidoRetirado !== undefined) configuracion.msjPedidoRetirado = { id: dto.idMsjPedidoRetirado } as Mensaje;
      if (dto.msjRetiro !== undefined) configuracion.msjRetiro = dto.msjRetiro;
      if (dto.msjEnvio !== undefined) configuracion.msjEnvio = dto.msjEnvio;

      configuracion.fechaActualizacion = new Date();

      await qR.manager.save(Configuracion, configuracion);

      // Las relaciones recien asignadas solo traen el id. Se relee para
      // devolver el nombre y el mensaje completos de cada una.
      const actualizada: Configuracion = await this.getEntityOrFail(qR, idEmpresa);

      return this.toRetorno(actualizada);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, 'Error al intentar editar la configuracion de la empresa');
    }
  }

  /**
   * Devuelve la configuracion de la empresa indicada.
   * Sin idEmpresa no hay empresa que consultar: super_admin tiene
   * id_empresa = NULL por constraint, asi que no tiene configuracion propia.
   */
  private async getEntityOrFail(qR: QueryRunner, idEmpresa?: string | null): Promise<Configuracion> {
    if (!idEmpresa) throw new NotFoundException('El usuario no tiene una empresa asociada');

    const datos: Configuracion[] = await qR.manager.find(Configuracion, {
      where: { idEmpresa },
      take: 1,
      relations: { sede: true, datoCobro: true, msjPedidoTomado: true, msjPedidoRetirado: true },
    });
    const dato: Configuracion | undefined = datos[0];
    if (!dato) throw new NotFoundException('No se encontro la configuracion de la empresa');

    return dato;
  }

  private toRetorno(configuracion: Configuracion): ConfiguracionRetorno {
    const retorno = new ConfiguracionRetorno({
      idEmpresa: configuracion.idEmpresa,
      fechaActualizacion: configuracion.fechaActualizacion,
      fechaEntrega: configuracion.fechaEntrega,
      horaEntrega: configuracion.horaEntrega,
      msjRetiro: configuracion.msjRetiro,
      msjEnvio: configuracion.msjEnvio,
    });

    const { sede, datoCobro, msjPedidoTomado, msjPedidoRetirado } = configuracion;

    if (sede) retorno.agregarSede({ id: sede.id, nombre: sede.nombre });
    if (datoCobro) retorno.agregarDatoCobro({ id: datoCobro.id, nombre: datoCobro.nombre, mensaje: datoCobro.mensaje });
    if (msjPedidoTomado) retorno.agregarMsjTomado({ id: msjPedidoTomado.id, nombre: msjPedidoTomado.nombre, mensaje: msjPedidoTomado.mensaje });
    if (msjPedidoRetirado) retorno.agregarMsjRetirado({ id: msjPedidoRetirado.id, nombre: msjPedidoRetirado.nombre, mensaje: msjPedidoRetirado.mensaje });

    return retorno;
  }
}
