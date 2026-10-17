import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { Configuracion } from './entity/configuracion.entity';
import { DtoConfiguracionEditar } from './dto/configuracionEditar.dto';
import { ConfiguracionRetorno } from './retorno/configuracion.retorno';

/**
 * Servicio de configuracion de la empresa.
 *
 * No extiende BaseService porque Configuracion no extiende Base:
 * la tabla configuraciones no tiene id, fecha_creacion ni deleted.
 * El filtrado por empresa lo hace el RLS de PostgreSQL automaticamente.
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
   * Devuelve la configuracion de la empresa actual.
   * No se filtra por empresa a mano: el RLS la acota sola.
   * Se usa find + take 1 porque manager.findOne exige un where.
   */
  async getConfiguracionOrFail(qR: QueryRunner): Promise<ConfiguracionRetorno> {
    try {
      const dato: Configuracion = await this.getEntityOrFail(qR);
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
  async updateConfiguracion(qR: QueryRunner, dto: DtoConfiguracionEditar): Promise<ConfiguracionRetorno> {
    try {
      const configuracion: Configuracion = await this.getEntityOrFail(qR);

      if (dto.fechaEntrega !== undefined) configuracion.fechaEntrega = dto.fechaEntrega;
      if (dto.horaEntrega !== undefined) configuracion.horaEntrega = dto.horaEntrega;
      if (dto.idSede !== undefined) configuracion.idSede = dto.idSede;
      if (dto.idDatoCobro !== undefined) configuracion.idDatoCobro = dto.idDatoCobro;
      if (dto.idMsjPedidoTomado !== undefined) configuracion.idMsjPedidoTomado = dto.idMsjPedidoTomado;
      if (dto.idMsjPedidoRetirado !== undefined) configuracion.idMsjPedidoRetirado = dto.idMsjPedidoRetirado;
      if (dto.msjRetiro !== undefined) configuracion.msjRetiro = dto.msjRetiro;
      if (dto.msjEnvio !== undefined) configuracion.msjEnvio = dto.msjEnvio;

      configuracion.fechaActualizacion = new Date();

      const newConfiguracion: Configuracion = await qR.manager.save(Configuracion, configuracion);

      return this.toRetorno(newConfiguracion);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, 'Error al intentar editar la configuracion de la empresa');
    }
  }

  private async getEntityOrFail(qR: QueryRunner): Promise<Configuracion> {
    const datos: Configuracion[] = await qR.manager.find(Configuracion, { take: 1 });
    const dato: Configuracion | undefined = datos[0];
    if (!dato) throw new NotFoundException('No se encontro la configuracion de la empresa');

    return dato;
  }

  private toRetorno(configuracion: Configuracion): ConfiguracionRetorno {
    return new ConfiguracionRetorno({
      idEmpresa: configuracion.idEmpresa,
      fechaActualizacion: configuracion.fechaActualizacion,
      fechaEntrega: configuracion.fechaEntrega,
      horaEntrega: configuracion.horaEntrega,
      idSede: configuracion.idSede,
      idDatoCobro: configuracion.idDatoCobro,
      idMsjPedidoTomado: configuracion.idMsjPedidoTomado,
      idMsjPedidoRetirado: configuracion.idMsjPedidoRetirado,
      msjRetiro: configuracion.msjRetiro,
      msjEnvio: configuracion.msjEnvio,
    });
  }
}
