import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateElementoControllerProp, CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Pedido } from './entity/pedido.entity';
import { DtoPedidoCrear } from './dto/pedidoCrear.dto';
import { DtoPedidoEditar } from './dto/pedidoEditar.dto';
import { Cliente } from '../cliente/entity/cliente.entity';
import { ClienteService } from '../cliente/cliente.service';
import { LibroPedidoService } from '@src/libro_pedido/libro_pedido.service';
import { LibroPedido } from '@src/libro_pedido/entity/libroPedido.entity';
import { DtoLibroPedidoCrear } from '@src/libro_pedido/dto/DtoCrearLibroPedido.dto';
import { CLIENTE_X_RESUMEN_RELATIONS, CLIENTE_X_RESUMEN_SELECTED } from '@src/cliente/default/relacion';

@Injectable()
export class PedidoService extends BaseService<typeof Entidad.PEDIDO, Pedido, DtoPedidoCrear, DtoPedidoEditar> {
  constructor(
    @InjectRepository(Pedido) private readonly pedidoRepository: Repository<Pedido>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    private readonly clienteService: ClienteService,
    @Inject(forwardRef(() => LibroPedidoService))
    private readonly libroPedidoService: LibroPedidoService,
  ) {
    super(pedidoRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ usuario, dto, qR, entidad }: CreateProp<DtoPedidoCrear, typeof Entidad.PEDIDO>): Promise<Pedido> {
    try {
      if (!dto.cliente && !dto.clienteDatos) throw new NotFoundException('Requiere datos del cliente');
      const cliente: Cliente = dto.cliente
        ? await this.clienteService.getDatoByIdOrFail({ id: dto.cliente, qR, entidadError: 'cliente', usuarioId: usuario.id, relaciones: [CLIENTE_X_RESUMEN_RELATIONS], selected: CLIENTE_X_RESUMEN_SELECTED })
        : await this.clienteService.createDato({ usuario, dto: dto.clienteDatos!, qR, entidad: Entidad.CLIENTE });

      const pedido: Pedido = new Pedido();
      pedido.fechaEntrega = dto.fechaEntrega;
      pedido.importeTotal = dto.importeTotal;
      pedido.archivos = dto.archivos;
      pedido.anillados = dto.anillados;
      pedido.sena = dto.sena;
      pedido.cliente = cliente;
      pedido.user = usuario;

      const newPedido: Pedido = qR
        ? await qR.manager.save(Pedido, pedido)
        : await this.pedidoRepository.save(pedido);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad,
          dato: newPedido
        }

        this.gatewayGateway.actualizacionDato(payload);
      }
      
      return newPedido;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.importeTotal} en el registro de ${entidad}`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Pedido, DtoPedidoEditar, typeof Entidad.PEDIDO>): Promise<UpdateRetorno<Pedido>> {
    try {
      const pedido: Pedido = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        relaciones,
        selected,
        entidadError
      });

      pedido.fechaEntrega = dto.fechaEntrega || pedido.fechaEntrega;
      pedido.importeTotal = dto.importeTotal || pedido.importeTotal;
      pedido.archivos = dto.archivos || pedido.archivos;
      pedido.anillados = dto.anillados || pedido.anillados;
      pedido.sena = dto.sena || pedido.sena;

      const newPedido: Pedido = qR
        ? await qR.manager.save(Pedido, pedido)
        : await this.pedidoRepository.save(pedido);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad,
          dato: newPedido
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return { dato: newPedido, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.importeTotal || id} en el registro de pedidos`)
    }
  }

  async createDatoCx({ usuario, dto, entidad }: CreateElementoControllerProp<DtoPedidoCrear, "pedido">): Promise<Pedido> {
    const qR: QueryRunner = this.dataSource.createQueryRunner();
    await qR.connect();
    await qR.startTransaction();
    try {
      const newPedido: Pedido = await this.createDato({ usuario, dto, qR, entidad });

      const libroPedidos: LibroPedido[] = await Promise.all(
        dto.librosPedidos?.map(lp => {
          const dtoLp: DtoLibroPedidoCrear = {
            ...lp,
            pedido_id: newPedido.id
          };
          
          return this.libroPedidoService.createDatoXEntidad({
            usuario,
            qR,
            dto: dtoLp,
            pedido: newPedido
          });
        })
      );
      
      newPedido.libroPedidos = libroPedidos;

      await qR.commitTransaction();

      
      console.log('metod createDatCx, en PedidoService: despues del commit qR, pedido: ',newPedido)

      const payload: Mensaje = {
        mensaje: Mens.CREAR,
        entidad: Entidad.PEDIDO,
        dato: newPedido
      }
      this.gateway.actualizacionDato(payload);

      return newPedido;
    } catch (er) {
      await qR.rollbackTransaction();
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el elemento en la entidad`)
    } finally {
      await qR.release();
    }
  }

}
