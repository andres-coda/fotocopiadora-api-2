import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { PrecioEmpresa } from './entity/precio_empresa.entity';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { DtoPrecioEmpresaCrear, DtoPrecioEmpresaEditar, DtoPrecioEmpresaRespuesta } from './dto/precio_empresa.dto';
import { Entidad, Mensaje } from '@src/gateway/dto/gatewayDto.dto';
import { Mens } from '@src/gateway/enum/Mens.enum';
import { PrecioService } from './precio.service';
import { Precio } from './entity/precio.entity';
import { UpdateRetorno } from '@src/base/interface/base.interface';


@Injectable()
export class PrecioEmpresaService {
  constructor(
    @InjectRepository(PrecioEmpresa)
    private readonly precioEmpresaRepo: Repository<PrecioEmpresa>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly erroresService: ErroresService,
    private readonly gateway: GatewayGateway,
    private readonly precioService: PrecioService
  ) {}

  /**
   * Devuelve todos los precios de la empresa actual.
   * El RLS filtra automáticamente por id_empresa.
   * Hace join con precio para traer nombre y descripcion.
   */
  async getPreciosEmpresa(qR?: QueryRunner): Promise<DtoPrecioEmpresaRespuesta[]> {
    try {
      const repo = qR ? qR.manager.getRepository(PrecioEmpresa) : this.precioEmpresaRepo;

      const precios = await repo.find({
        relations: ['precio'],
        order: { precio: { nombre: 'ASC' } } as any,
      });

      return precios.map((pe) => this.toRespuesta(pe));
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al leer precios de la empresa');
    }
  }

  /**
   * Busca un precio de empresa por idPrecio.
   * RLS garantiza que solo se accede al de la empresa actual.
   */
  async getPrecioEmpresaById(
    idPrecio: string,
    qR?: QueryRunner,
  ): Promise<DtoPrecioEmpresaRespuesta> {
    try {
      const repo = qR ? qR.manager.getRepository(PrecioEmpresa) : this.precioEmpresaRepo;

      const pe = await repo.findOne({
        where: { idPrecio },
        relations: ['precio'],
      });

      if (!pe) throw new NotFoundException(`No se encontró el precio ${idPrecio} para esta empresa`);

      return this.toRespuesta(pe);
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al leer precio ${idPrecio}`);
    }
  }

  /**
   * Crea un precio para la empresa actual.
   * id_empresa lo inyecta PostgreSQL via RLS / DEFAULT fc_empresa_actual().
   * Si la BD no tiene DEFAULT, obtenemos el id_empresa del GUC:
   *   SELECT current_setting('app.empresa_id')
   */
  async createPrecioEmpresa(
    dto: DtoPrecioEmpresaCrear,
    qR: QueryRunner,
  ): Promise<DtoPrecioEmpresaRespuesta> {
    try {

      let precio:Precio | null = await this.precioService.getDatoByName({
        dato:dto.nombre,
        qR,
        entidadError: 'precio'
      });

      if(!precio){
        precio = await this.precioService.createDato({dto, qR, entidad: Entidad.PRECIO});
      }

      const pe = new PrecioEmpresa();
      pe.idPrecio =precio.id;
      pe.importe = dto.importe;
      pe.detalles = dto.detalles;

      const saved = await qR.manager.save(PrecioEmpresa, pe);

      // Recargar con la relación precio para devolver nombre
      const conRelacion = await qR.manager.findOne(PrecioEmpresa, {
        where: { idEmpresa: saved.idEmpresa, idPrecio: saved.idPrecio },
        relations: ['precio'],
      });

      const retorno = this.toRespuesta(conRelacion!);
      this.gateway.actualizacionDato({
        mensaje: Mens.CREAR,
        entidad: Entidad.PRECIO,
        dato: retorno,
      } as Mensaje);

      return retorno;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al crear precio de empresa');
    }
  }

  async updatePrecioEmpresa(
    idPrecio: string,
    dto: DtoPrecioEmpresaEditar,
    qR: QueryRunner,
  ): Promise<DtoPrecioEmpresaRespuesta> {
    try {
      let precio: UpdateRetorno<Precio> | undefined;
      if(dto.nombre) {
        precio = await this.precioService.updateDato({
          dto: {nombre: dto.nombre}, 
          qR, 
          id:idPrecio, 
          entidadError:'precio',
          entidad:Entidad.PRECIO
        })
      }

      const pe = await qR.manager.findOne(PrecioEmpresa, {
        where: { idPrecio },
        relations: ['precio'],
      });

      if (!pe) throw new NotFoundException(`No se encontró el precio ${idPrecio} para esta empresa`);

      if (dto.importe !== undefined) pe.importe = dto.importe;
      if (dto.detalles !== undefined) pe.detalles = dto.detalles;

      const saved = await qR.manager.save(PrecioEmpresa, pe);
      const retorno = this.toRespuesta({ ...saved, precio: pe.precio });

      this.gateway.actualizacionDato({
        mensaje: Mens.EDITAR,
        entidad: Entidad.PRECIO,
        dato: retorno,
      } as Mensaje);

      return retorno;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al editar precio ${idPrecio}`);
    }
  }

  async deletePrecioEmpresa(idPrecio: string, qR: QueryRunner): Promise<boolean> {
    try {
      const pe = await qR.manager.findOne(PrecioEmpresa, { where: { idPrecio } });
      if (!pe) throw new NotFoundException(`No se encontró el precio ${idPrecio}`);

      await qR.manager.remove(PrecioEmpresa, pe);

      this.gateway.actualizacionDato({
        mensaje: Mens.ELIMINAR,
        entidad: Entidad.PRECIO,
        id: idPrecio,
      } as Mensaje);

      return true;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al eliminar precio ${idPrecio}`);
    }
  }

  private toRespuesta(pe: PrecioEmpresa): DtoPrecioEmpresaRespuesta {
    return {
      idPrecio: pe.idPrecio,
      idEmpresa: pe.idEmpresa,
      nombre: pe.precio?.nombre ?? '',
      descripcion: pe.precio?.descripcion,
      fecha_actualizacion:pe.fechaActualizacion,
      fecha_creacion: pe.fechaCreacion,
      delete: pe.deleted ?? false,
      importe: Number(pe.importe),
      detalles: pe.detalles,
    };
  }
}
