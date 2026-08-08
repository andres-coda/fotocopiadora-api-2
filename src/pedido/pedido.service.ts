import { Injectable, NotFoundException } from '@nestjs/common';
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
import { DtoPedidoItemRespuesta } from '../pedido_item/dto/pedido_item.dto';
import { GetPedidoItemBusqueda } from '@src/pedido_item/interface/pedido_item_busqueda.interface';
import { toRespuestaPedido } from './utils/toRespuestaPedido';
import { toRespuestaPedidoItemCompleto } from '../pedido_item/utils/toRespuestaItem';

@Injectable()
export class PedidoService extends BaseService<typeof Entidad.PEDIDO, Pedido, DtoPedidoCrear, DtoPedidoEditar> {
  constructor(
    @InjectRepository(Pedido) private readonly pedidoRepository: Repository<Pedido>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(pedidoRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDatoAuxiliar({ dto, qR, entidad }: CreateProp<DtoPedidoCrear, typeof Entidad.PEDIDO>): Promise<DtoPedidoRespuesta> {
    try {
      if (!qR) throw new NotFoundException('No se pudo crear transacción para la operación');
      if (!dto.cliente && !dto.clienteDatos) throw new NotFoundException('Requiere datos del cliente');
      console.log(JSON.stringify(dto.pedidoItems, null, 2));
      const [row] = await qR.query(
        'select * from fc_crear_pedido($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb) as resultado',
        [
          dto.clienteDatos?.telefono, dto.clienteDatos?.email, dto.clienteDatos?.nombre, dto.cliente, dto.fechaEntrega, dto.importeTotal,
          dto.archivos, dto.anillados, dto.sena,JSON.stringify(dto.pedidoItems)
        ]
      );

      return row.resultado;

    } catch (er) {
      console.dir(er, { depth: null });
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.importeTotal} en el registro de ${entidad}`)
    }
  }

  async createDato({ dto, qR, entidad }: CreateProp<DtoPedidoCrear, typeof Entidad.PEDIDO>): Promise<Pedido> {
    try {
      throw new NotFoundException('Metodo no implementado');
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

      const retorno: DtoPedidoRespuesta | undefined = await this.createDatoAuxiliar({ dto, entidad, qR });

      if (!retorno) throw new NotFoundException(`No se pudo preparar el pedido para su retorno`);

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

  remplaceToReturn(entidad: Pedido): DtoPedidoRespuesta | undefined {
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
