import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, ILike, Raw, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { Precio } from './entity/precio.entity';
import { DtoPrecioCrear, DtoPrecioEditar, DtoPrecioRespuesta } from './dto/precio.dto';
import { BusquedaGenericoProp, CreateGenericoProp, GetGenericoByIdProp, GetGenericoProp, RetornoGenericoServiceGet, UpdateGenericoProp } from '@src/interface/general.interface';

@Injectable()
export class PrecioService {
  constructor(
    @InjectRepository(Precio) private readonly precioRepository: Repository<Precio>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) { }

  async getDatoByIdOrFail({ id, qR }: GetGenericoByIdProp): Promise<Precio> {
    try {
      const precio: Precio | null = await this.getDatoById({ id, qR });
      if (!precio) throw new NotFoundException(`El precio id ${id} no se encontro en la base de datos`);
      return precio
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer el ${id} en la tabla de precios`)
    }
  }

  async getDatos({ qR, limite, offset }: GetGenericoProp): Promise<RetornoGenericoServiceGet<Precio>> {
    try {
      const criterio: FindManyOptions = {
        order: {
          'nombre': 'ASC'
        },
        take: limite ?? 20,
        skip: offset ?? 0
      }

      const [datos, total] = await qR.manager.findOne(Precio, criterio);

      return { datos, total }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer los precios de la pagina ${offset}`)
    }
  }

  async getDatoById({ id, qR }: GetGenericoByIdProp): Promise<Precio | null> {
    try {
      const criterio: FindOneOptions = {
        where: { id: id }
      }

      return await qR.manager.findOne(Precio, criterio);
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer el precio ${id}`)
    }
  }

  async getDatoByName({ id, qR }: GetGenericoByIdProp): Promise<Precio | null> {
    try {
      const criterio: FindOneOptions = {
        where: {
          nombre: Raw(alias => `LOWER(${alias}) = LOWER(:id)`, {
            id,
          }),
        },
      }

      return await qR.manager.findOne(Precio, criterio);
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer el precio ${id}`)
    }
  }

  async getDatoByAbrev({ id, qR }: GetGenericoByIdProp): Promise<Precio | null> {
    try {
      const criterio: FindOneOptions = {
        where: {
          abreviatura: Raw(alias => `LOWER(${alias}) = LOWER(:id)`, {
            id,
          }),
        },
      }

      return await qR.manager.findOne(Precio, criterio);
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer el precio ${id}`)
    }
  }

  async getPreciosBusqueda({ qR, limite, offset, busqueda }: BusquedaGenericoProp): Promise<RetornoGenericoServiceGet<DtoPrecioRespuesta>> {
    try {
      const criterio: FindManyOptions = {
        relations: [],
        where: {
            nombre: ILike(`%${busqueda}%`)
        },
        take: limite ?? 20,
        skip: offset ?? 0
      }

      const [datos, total] = await qR.manager.findAndCount(Precio, criterio);

      return {
        total,
        datos: datos.map((pe) => this.remplaceToReturn(pe))
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al leer precios');
    }
  }

  async createDato({ dto, qR }: CreateGenericoProp<DtoPrecioCrear>): Promise<Precio> {
    try {
      const precioExistente: Precio | null = await this.getDatoByName({
        id: dto.nombre,
        qR
      });

      if (precioExistente) return precioExistente;

      const precio: Precio = new Precio();
      precio.nombre = dto.nombre;
      precio.descripcion = dto.descripcion;
      precio.abreviatura = dto.abreviatura;

      const newPrecio: Precio = qR
        ? await qR.manager.save(Precio, precio)
        : await this.precioRepository.save(precio);

      return newPrecio;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el precio ${dto.nombre}`)
    }
  }

  async updateDato({ dto, qR, id }: UpdateGenericoProp<DtoPrecioEditar>): Promise<Precio> {
    try {
      const precio: Precio = await this.getDatoByIdOrFail({
        id,
        qR
      });
      if (precio.descripcion && precio.descripcion.length != 0) {
        throw new NotFoundException('No puede editar el nombre de los precios usados para calcular el valor de los libros');
      }
      if (!dto.nombre || precio.nombre === dto.nombre) return precio;

      precio.nombre = dto.nombre ?? precio.nombre;
      precio.descripcion = dto.descripcion ?? precio.descripcion;

      const newPrecio: Precio = await qR.manager.save(Precio, precio);

      return newPrecio;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el precio ${dto.nombre || id}`)
    }
  }

  async updatePrecio({ dto, qR, id }: UpdateGenericoProp<DtoPrecioEditar>): Promise<DtoPrecioRespuesta> {
    try {
      const precio: Precio = await this.getDatoByIdOrFail({
        id,
        qR
      });
      if (precio.descripcion && precio.descripcion.length != 0) {
        throw new NotFoundException('No puede editar el nombre de los precios usados para calcular el valor de los libros');
      }
      if (!dto.nombre || precio.nombre === dto.nombre) return this.remplaceToReturn(precio);

      precio.nombre = dto.nombre ?? precio.nombre;
      precio.descripcion = dto.descripcion ?? precio.descripcion;

      const newPrecio: Precio = await qR.manager.save(Precio, precio);

      return this.remplaceToReturn(newPrecio);

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el precio ${dto.nombre || id}`)
    }
  }

  async deletePrecio({ id, qR }: GetGenericoByIdProp): Promise<boolean> {
    try {
      const precio: Precio = await this.getDatoByIdOrFail({ id, qR });

      const newPrecio: Precio = await qR.manager.remove(Precio, precio);
      if (!newPrecio) throw new NotFoundException(`Fallo el intento de eliminar el precio id ${id}`)
      return true
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar eliminar el precio ${id}`)
    }
  }

  remplaceToReturn(entidad: Precio): DtoPrecioRespuesta {
    return {
      id: entidad.id,
      nombre: entidad.nombre,
      descripcion: entidad.descripcion,
      abreviatura: entidad.abreviatura,
    }
  }
}
