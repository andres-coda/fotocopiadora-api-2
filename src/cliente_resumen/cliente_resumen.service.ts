import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { ClienteResumen } from './entity/clienteResumen.entity';
import { Estado } from '../interface/estado.interface';
import { estadosPendientes, estadosRetirados } from '../utils/estados';
import { DtoResumenCrear } from './dto/clienteResumenCrear.dto';
import { DtoResumenEditar } from './dto/clienteResumenEditar.dto';
import { Cliente } from '@src/cliente/entity/cliente.entity';
import { ClienteService } from '@src/cliente/cliente.service';
import { DtoResumenRespuesta } from './dto/clienteResumenRespuesta.dto';

interface CreateDatoXEntidadProp extends Omit<CreateProp<DtoResumenCrear, typeof Entidad.RESUMEN>, "entidad"> {
  cliente: Cliente
}

@Injectable()
export class ClienteResumenService extends BaseService<typeof Entidad.RESUMEN, ClienteResumen, DtoResumenCrear, DtoResumenEditar> {
  constructor(
    @InjectRepository(ClienteResumen) private readonly resumenRepository: Repository<ClienteResumen>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    @Inject(forwardRef(() => ClienteService))
    private readonly clienteService: ClienteService,
  ) {
    super(resumenRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ usuario, qR, dto, entidad }: CreateProp<DtoResumenCrear, typeof Entidad.RESUMEN>): Promise<ClienteResumen> {
    try {
      if (!dto.cliente_id) throw new NotFoundException("Falta el id del cliente para crear el resumen")

      const cliente: Cliente = await this.clienteService.getDatoByIdOrFail({
        id: dto.cliente_id,
        qR,
        usuarioId: usuario.id,
        entidadError: 'cliente',
      });

      const newClienteResumen: ClienteResumen = await this.createDatoXEntidad({
        qR,
        usuario,
        cliente,
        dto
      })
      return newClienteResumen;

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

      const iguales = dto.anterior
        ? (estadosPendientes.has(dto.actual) && estadosPendientes.has(dto.anterior))
        || (estadosRetirados.has(dto.actual) && estadosRetirados.has(dto.anterior))
        : false;

      if (iguales) return { dato: resumenExistente, isQr: false };

      const resumen: ClienteResumen = resumenExistente.verificarResumen(dto)

      const newClienteResumen: ClienteResumen = qR
        ? await qR.manager.save(ClienteResumen, resumen)
        : await this.resumenRepository.save(resumen);

      if (!qR || !qR.manager) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad: entidad,
          dato: newClienteResumen
        }

        this.gatewayGateway.actualizacionDato(payload);
      }
      return { dato: newClienteResumen, isQr: true };

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${id} en el registro de resumen de cliente`)
    }
  }

  async createDatoXEntidad({ usuario, cliente, qR, dto }: CreateDatoXEntidadProp): Promise<ClienteResumen> {
    try {
      const resumen: ClienteResumen = new ClienteResumen();
      if (dto.estado) {
        resumen.listo = dto.estado === Estado.LISTO ? 1 : 0;
        resumen.pendiente = estadosPendientes.has(dto.estado) ? 1 : 0;
        resumen.retirado = estadosRetirados.has(dto.estado) ? 1 : 0;
      }
      resumen.user = usuario;
      resumen.cliente = cliente;

      const newClienteResumen: ClienteResumen = qR
        ? await qR.manager.save(ClienteResumen, resumen)
        : await this.resumenRepository.save(resumen);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad: Entidad.RESUMEN,
          dato: newClienteResumen
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return newClienteResumen;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el resumen`)
    }
  }

  public remplaceToReturn(entidad: ClienteResumen): DtoResumenRespuesta {
    const base = this.remplaceToBase(entidad);
    return {
      ...base,

      pendiente: entidad.pendiente,
      listo: entidad.listo,
      retirado: entidad.retirado,

    };
  }
}
