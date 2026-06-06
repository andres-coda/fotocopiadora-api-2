import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, QueryRunner, Repository } from 'typeorm';
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
import { LibroPedidoService } from '../libro_pedido/libro_pedido.service';
import { LibroPedido } from '../libro_pedido/entity/libroPedido.entity';
import { DtoLibroPedidoCrear } from '../libro_pedido/dto/DtoCrearLibroPedido.dto';
import { CLIENTE_X_RESUMEN_RELATIONS, CLIENTE_X_RESUMEN_SELECTED } from '../cliente/default/relacion';
import { DtoPedidoEstadoRespuesta, DtoPedidoRespuesta, DtoPedidoRespuestaCliente } from './dto/pedidoRetorno.dto';
import { DtoBaseRetorno } from '../base/dto/baseRetorno.dto';
import { DtoLibroPedidoRespuesta } from '../libro_pedido/dto/libroPedidoRetorno.dto';
import { DtoClienteRespuesta } from '../cliente/dto/clienteRespuesta.dto';
import { GetPedidoXLibro } from './interface/pedido.interface';
import { PEDIDO_RELATIONS, PEDIDO_RELATIONS_BY_ID, PEDIDO_RELATIONS_LIBRO_ID, PEDIDO_SELECTED, PEDIDO_SELECTED_BY_ID, PEDIDO_SELECTED_LIBRO_ID } from './default/relacion';
import { Estado } from '@src/interface/estado.interface';

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
          dato: this.remplaceToReturn(newPedido)
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return {...newPedido,cliente:cliente};

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
          dato: this.remplaceToReturn(newPedido)
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return { dato: newPedido, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.importeTotal || id} en el registro de pedidos`)
    }
  }

  async createDatoCx({ usuario, dto, entidad }: CreateElementoControllerProp<DtoPedidoCrear, "pedido">): Promise<DtoPedidoRespuesta> {
    const qR: QueryRunner = this.dataSource.createQueryRunner();
    await qR.connect();
    await qR.startTransaction();
    try {
      const newPedido: Pedido = await this.createDato({ usuario, dto, qR, entidad });

      console.log('---- Pedido creado ----', newPedido)

      const libroPedidos: LibroPedido[] = await Promise.all(
        dto.librosPedidos?.map(lp => {
          const dtoLp: DtoLibroPedidoCrear = {
            ...lp,
            pedido_id: newPedido.id
          };

          console.log('-----Pedido para crear ---- ',lp)
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

      const retorno: DtoPedidoRespuesta = this.remplaceToReturn(newPedido);

      const payload: Mensaje = {
        mensaje: Mens.CREAR,
        entidad: Entidad.PEDIDO,
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

  remplaceToEstadoReturn(entidad: Pedido): DtoPedidoEstadoRespuesta {
    const base: DtoBaseRetorno = this.remplaceToBase(entidad);
    return {
      ...base,
      estado: entidad.estado
    }
  }

  remplaceToReturn(entidad: Pedido): DtoPedidoRespuesta {
    const base: DtoBaseRetorno = this.remplaceToBase(entidad);
    const libroPedidos: DtoLibroPedidoRespuesta[] = entidad.libroPedidos?.length > 0
      ? entidad.libroPedidos.map(lp => this.libroPedidoService.remplaceToReturn(lp))
      : [];

    const cliente: DtoClienteRespuesta = this.clienteService.remplaceToReturn(entidad.cliente);

    return {
      ...base,

      fechaEntrega: entidad.fechaEntrega,
      importeTotal: entidad.importeTotal,
      archivos: entidad.archivos,
      anillados: entidad.anillados,
      sena: entidad.sena,
      estado: entidad.estado,
      cliente,
      libroPedidos,
    }
  }

  remplaceToReturnCliente(entidad: Pedido): DtoPedidoRespuestaCliente {
    const base: DtoBaseRetorno = this.remplaceToBase(entidad);
    const libroPedidos: DtoLibroPedidoRespuesta[] = entidad.libroPedidos?.length > 0
      ? entidad.libroPedidos.map(lp => this.libroPedidoService.remplaceToReturn(lp))
      : [];

    return {
      ...base,

      fechaEntrega: entidad.fechaEntrega,
      importeTotal: entidad.importeTotal,
      archivos: entidad.archivos,
      anillados: entidad.anillados,
      sena: entidad.sena,
      estado:entidad.estado,
      libroPedidos,
    }
  }

  async getDatoXLibro({ estado, id_libro, usuarioId, qR }: GetPedidoXLibro): Promise<Pedido[]> {
    try {
      if (!id_libro || !estado) return [];
      const criterio: FindManyOptions = this.crearCriterio<FindManyOptions>({
        relaciones: [PEDIDO_RELATIONS_LIBRO_ID],
        selected: PEDIDO_SELECTED_LIBRO_ID,
        where: {
          libroPedidos: {
            libro: {
              id: id_libro
            },
            estado: estado
          },
        },
        usuarioId,
        orden: 'fechaEntrega'

      });

      const datos: Pedido[] = qR
        ? await qR.manager.find(Pedido, criterio)
        : await this.baseRepository.find(criterio)

      return datos;

    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer los pedidos del libro con id ${id_libro} y el estado ${estado}`)
    }

  }

  private estadoPedido(libroPedidos?: DtoLibroPedidoRespuesta[]): Estado {
    if (!libroPedidos?.length) {
      return Estado.PENDIENTE;
    }

    const estados = new Set(libroPedidos.map(lp => lp.estado));

    // Cualquier pedido no terminado => pendiente
    if (
      estados.has(Estado.PENDIENTE) ||
      estados.has(Estado.IMPRESO_COMPLETO) ||
      estados.has(Estado.IMPRESO_MITAD)
    ) {
      return Estado.PENDIENTE;
    }

    if (estados.has(Estado.LISTO)) {
      return Estado.LISTO;
    }

    if (estados.has(Estado.RETIRADO)) {
      return Estado.RETIRADO;
    }

    if (estados.has(Estado.CANCELADO)) {
      return Estado.CANCELADO;
    }

    return Estado.RETIRADO;
  }

}
