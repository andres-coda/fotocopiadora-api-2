import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { ClienteResumen } from "./entity/clienteResumen.entity";
import { DataSource, Repository, QueryRunner, FindOneOptions } from "typeorm";
import { ErroresService } from "@src/error/error.service";

interface getResumenIdProp{
  id:string;
  qR:QueryRunner;
}
@Injectable()
export class ClienteResumenService {
  constructor(
    @InjectRepository(ClienteResumen) private readonly libroPedidoRepository: Repository<ClienteResumen>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
  ) { }

  async getDatoByIdOrFail({ id, qR }: getResumenIdProp): Promise<ClienteResumen> {
    try {
      const criterio: FindOneOptions = {
        where: {
          'id': id
        },
      }
      const resumen = await qR.manager.findOne(ClienteResumen, criterio);
      if (!resumen) throw new NotFoundException(`No se encontro el resumen para el cliente ${id}`);
      return resumen;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al buscar el resumen del cliente ${id}`);
    }
  }
}