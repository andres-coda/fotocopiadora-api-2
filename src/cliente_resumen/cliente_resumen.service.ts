import { Injectable } from '@nestjs/common';
import { BaseService } from '@src/base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '@src/base/interface/base.interface';
import { Entidad, Mensaje } from '@src/gateway/dto/gatewayDto.dto';
import { Mens } from '@src/gateway/enum/Mens.enum';
import { ClienteResumen } from './entity/clienteResumen.entity';
import { Estado } from '@src/interface/estado.interface';
import { estadosPendientes, estadosRetirados } from '@src/utils/estados';
import { DtoResumenCrear } from './dto/clienteResumenCrear.dto';
import { DtoResumenEditar } from './dto/clienteResumenEditar.dto';

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
      if (dto.estado) {
        resumen.listo = dto.estado === Estado.LISTO ? 1 : 0;
        resumen.pendiente = estadosPendientes.has(dto.estado) ? 1 : 0;
        resumen.retirado = estadosRetirados.has(dto.estado) ? 1 : 0;
      }
      resumen.user = usuario;

      const newClienteResumen: ClienteResumen = qR
        ? await qR.manager.save(ClienteResumen, resumen)
        : await this.resumenRepository.save(resumen);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad: entidad,
          dato: newClienteResumen
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return resumen;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el resumen`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<ClienteResumen, DtoResumenEditar, typeof Entidad.RESUMEN>): Promise<UpdateRetorno<ClienteResumen>> {
    try {
      const resumenExistente: ClienteResumen = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        relaciones,
        selected,
        entidadError,
      });

      const iguales: boolean = estadosPendientes.has(dto.actual) === estadosPendientes.has(dto.anterior) || estadosRetirados.has(dto.actual) === estadosRetirados.has(dto.anterior);

      if (iguales) return { dato: resumenExistente, isQr: false };

      const resumen: ClienteResumen = resumenExistente.verificarResumen(dto)

      const newClienteResumen: ClienteResumen = qR
        ? await qR.manager.save(ClienteResumen, resumen)
        : await this.resumenRepository.save(resumen);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad: entidad,
          dato: newClienteResumen
        }

        this.gatewayGateway.actualizacionDato(payload);
      }
      return { dato: resumen, isQr: true };

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${id} en el registro de ${entidadError}`)
    }
  }
}
