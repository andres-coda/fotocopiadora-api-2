import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { ClienteResumen } from './entity/clienteResumen.entity';
import { DtoResumenCrear } from './dto/clienteResumenCrear.dto';
import { DtoResumenEditar } from './dto/clienteResumenEditar.dto';
import { Cliente } from '../cliente/entity/cliente.entity';
import { DtoResumenRespuesta } from './dto/clienteResumenRespuesta.dto';

@Injectable()
export class ClienteResumenService extends BaseService<typeof Entidad.RESUMEN, ClienteResumen, DtoResumenCrear, DtoResumenEditar> {
  constructor(
    @InjectRepository(ClienteResumen) private readonly resumenRepository: Repository<ClienteResumen>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(resumenRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ usuario, qR, dto, entidad }: CreateProp<DtoResumenCrear, typeof Entidad.RESUMEN>): Promise<ClienteResumen> {
    try {

      const resumen: ClienteResumen = new ClienteResumen();
      resumen.user = usuario;
      resumen.cliente = dto.cliente;

      const newClienteResumen: ClienteResumen = qR
        ? await qR.manager.save(ClienteResumen, resumen)
        : await this.resumenRepository.save(resumen);

      console.log('----- Resumen ----- ',newClienteResumen)
      return newClienteResumen;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el resumen`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<ClienteResumen, DtoResumenEditar, typeof Entidad.RESUMEN>): Promise<UpdateRetorno<ClienteResumen>> {
    throw new NotFoundException('updateDato para resumenCliente no esta implementado')

  }

  public remplaceToReturn(entidad: ClienteResumen): DtoResumenRespuesta {
    const base = this.remplaceToBase(entidad);
    return {
      ...base,

      pendiente: entidad.pendiente,
      listo: entidad.listo,
      retirado: entidad.retirado,
      cancelado: entidad.cancelado

    };
  }
}
