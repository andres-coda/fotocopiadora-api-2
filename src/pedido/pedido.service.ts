import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Pedido } from './entity/pedido.entity';
import { DtoPedidoCrear, DtoPedidoEditar, DtoPedidoRespuesta } from './dto/pedido.dto';
import { Cliente } from '../cliente/entity/cliente.entity';
import { ClienteService } from '../cliente/cliente.service';
import { LibroPedidoService } from '../libro_pedido/pedido_item.service';
import { DtoLibroPedidoCrear, DtoPedidoItemRespuesta } from '../libro_pedido/dto/pedido_item.dto';
import { CLIENTE_RELATIONS, CLIENTE_X_RESUMEN_SELECTED } from '../cliente/default/relacion';
import { PedidoItem } from '@src/libro_pedido/entity/pedido_item.entity';
import { toRespuestaPedido, toRespuestaPedidoItemCompleto } from '@src/utils/toRespuesta.function';
import { GetPedidoItemBusqueda } from '@src/libro_pedido/interface/pedido_item_busqueda.interface';

@Injectable()
export class PedidoService extends BaseService<typeof Entidad.PEDIDO, Pedido, DtoPedidoCrear, DtoPedidoEditar> {
  constructor(
    @InjectRepository(Pedido) private readonly pedidoRepository: Repository<Pedido>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    private readonly clienteService: ClienteService,
    @Inject(forwardRef(() => LibroPedidoService))
    private readonly pedidoItemService: LibroPedidoService,
  ) {
    super(pedidoRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ dto, qR, entidad }: CreateProp<DtoPedidoCrear, typeof Entidad.PEDIDO>): Promise<Pedido> {
    try {
      if (!dto.cliente && !dto.clienteDatos) throw new NotFoundException('Requiere datos del cliente');
      const cliente: Cliente = dto.cliente
        ? await this.clienteService.getDatoByIdOrFail({ id: dto.cliente, qR, entidadError: 'cliente', relaciones: [CLIENTE_RELATIONS], selected: CLIENTE_X_RESUMEN_SELECTED })
        : await this.clienteService.createDato({ dto: dto.clienteDatos!, qR, entidad: Entidad.CLIENTE });

      const pedido: Pedido = new Pedido();
      pedido.fechaEntrega = dto.fechaEntrega;
      pedido.importeTotal = dto.importeTotal;
      pedido.archivos = dto.archivos;
      pedido.anillados = dto.anillados;
      pedido.sena = dto.sena;
      pedido.cliente = cliente;

      const newPedido: Pedido = qR
        ? await qR.manager.save(Pedido, pedido)
        : await this.pedidoRepository.save(pedido);

      return newPedido;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.importeTotal} en el registro de ${entidad}`)
    }
  }

  async updateDato({ dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Pedido, DtoPedidoEditar, typeof Entidad.PEDIDO>): Promise<UpdateRetorno<Pedido>> {
    try {
      const pedido: Pedido = await this.getDatoByIdOrFail({
        id,
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

      return { dato: newPedido, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.importeTotal || id} en el registro de pedidos`)
    }
  }

  async createDatoCx({ dto, entidad, qR }: CreateProp<DtoPedidoCrear, "pedido">): Promise<DtoPedidoRespuesta> {
    try {
      if (!dto.pedidoItems || dto.pedidoItems.length === 0) throw new NotFoundException('No se puede crear un pedido sin sus items');
      const newPedido: Pedido = await this.createDato({ dto, qR, entidad });

      const pedidoItems: PedidoItem[] = await Promise.all(
        dto.pedidoItems?.map(lp => {
          const dtoLp: DtoLibroPedidoCrear = {
            ...lp,
            pedido_id: newPedido.id
          };

          return this.pedidoItemService.createDatoXEntidad({
            qR,
            dto: dtoLp,
            pedido: newPedido
          });
        })
      );

      newPedido.pedidoItems = pedidoItems;

      const retorno: DtoPedidoRespuesta | undefined = this.remplaceToReturn(newPedido);

      if(!retorno) throw new NotFoundException(`No se pudo preparar el pedido para su retorno`);

      const payload: Mensaje = {
        mensaje: Mens.CREAR,
        entidad: Entidad.PEDIDO,
        dato: retorno
      }
      this.gateway.actualizacionDato(payload);

      return retorno;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el elemento en la entidad`)
    }
  }

  remplaceToReturn(entidad: Pedido): DtoPedidoRespuesta | undefined{
    return toRespuestaPedido(entidad);
  }

  async buscarPedidos(
    busqueda: string,
    estado: number | null,
    limite = 20,
    offset = 0,
    qR?: QueryRunner,
  ): Promise<DtoPedidoItemRespuesta[]> {
    try {
      const runner = qR ?? this.dataSource.createQueryRunner();
      if (!qR) await runner.connect();

      const rows = await runner.query(
        `SELECT * FROM fc_buscar_pedido($1, $2, $3, $4)`,
        [busqueda, estado, limite, offset],
      );

      if (!qR) await runner.release();

      return rows.map((r: GetPedidoItemBusqueda) => toRespuestaPedidoItemCompleto(r));
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al buscar pedidos');
    }
  }

}
