import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '@src/base/base.service';
import { DtoLibroCrear } from './dto/libroCrear.dto';
import { DtoLibroEditar } from './dto/libroEditar.dto';
import { Libro } from './entity/libro.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { CreateProp, EditarProp } from '@src/base/interface/base.interface';
import { LIBRO_RELATIONS, SELECTED_LIBRO } from './default/relacion.default';
import { Entidad, Mensaje } from '@src/gateway/dto/gatewayDto.dto';
import { Mens } from '@src/gateway/enum/Mens.enum';
import { MateriaService } from '@src/materia/materia.service';
import { Materia } from '@src/materia/entity/materia.entity';
import { StockService } from '@src/stock/stock.service';
import { DtoStockCrear } from '@src/stock/dto/stockCrear.dto';
import { Stock } from '@src/stock/entity/stock.entity';
import { DtoStockEditar } from '@src/stock/dto/stockEditar.dto';
import { Estado } from '@src/interface/estado.interface';

@Injectable()
export class LibroService extends BaseService<Libro, DtoLibroCrear, DtoLibroEditar> {
  constructor(
    @InjectRepository(Libro) private readonly libroRepository: Repository<Libro>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    private readonly materiaService: MateriaService,
    private readonly stockService: StockService,
  ) {
    super(libroRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ usuario, dto, qR, entidad }: CreateProp<DtoLibroCrear>): Promise<Libro> {
    try {
      const libroExiste: Libro | null = await this.getDatoByName({
        dato: dto.nombre,
        usuarioId: usuario.id,
        qR,
        relaciones: [LIBRO_RELATIONS],
        selected: SELECTED_LIBRO,
        entidadError: 'libro'
      });

      if (libroExiste) return libroExiste;

      const materia: Materia = await this.materiaService.createDato({
        usuario,
        dto: { nombre: dto.materia },
        qR,
        entidad: Entidad.MATERIA
      });

      const dtoStock: DtoStockCrear = { stock: 0 };

      const stock: Stock = await this.stockService.createDato({ usuario, qR, dto: dtoStock, entidad: 'stock' })

      const libro: Libro = new Libro();
      libro.nombre = dto.nombre;
      libro.autor = dto.autor || undefined;
      libro.cantidadPg = dto.cantidadPg || 0;
      libro.descripcion = dto.descripcion || undefined;
      libro.editorial = dto.editorial || undefined;
      libro.anio = dto.anio || undefined;
      libro.img = dto.img || undefined;
      libro.materia = materia;
      libro.stock = stock;
      libro.user = usuario;

      const newLibro: Libro = qR
        ? await qR.manager.save(Libro, libro)
        : await this.libroRepository.save(libro);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad: Entidad.LIBRO,
          id: newLibro.id
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return libro;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected }: EditarProp<Libro, DtoLibroEditar>): Promise<Libro> {
    try {
      const libro: Libro = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        relaciones,
        selected,
        entidadError
      });

      const materia: Materia | null = dto.materia ?
        await this.materiaService.createDato({
          usuario: libro.user,
          dto: { nombre: dto.materia },
          qR,
          entidad: Entidad.MATERIA
        })
        : libro.materia;

      libro.nombre = dto.nombre || libro.nombre;
      libro.autor = dto.autor || libro.autor;
      libro.cantidadPg = dto.cantidadPg || libro.cantidadPg;
      libro.descripcion = dto.descripcion || libro.descripcion;
      libro.editorial = dto.editorial || libro.editorial;
      libro.anio = dto.anio || libro.anio;
      libro.img = dto.img || libro.img;
      libro.materia = materia;

      const newLibro: Libro = qR
        ? await qR.manager.save(Libro, libro)
        : await this.libroRepository.save(libro);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad: Entidad.LIBRO,
          id: newLibro.id
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return libro;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de libros`)
    }
  }

  async agregarStock({ usuarioId, dto, qR, id, entidadError, relaciones, selected }: EditarProp<Libro, DtoStockCrear>): Promise<Stock> {
    try {
      const libro: Libro = await this.getDatoByIdOrFail({ id, qR, relaciones, entidadError, selected, usuarioId });
      const dtoStock: DtoStockEditar = {
        anterior: Estado.CANCELADO,
        actual: Estado.STOCK,
        cantidad: dto.stock
      }
      const stock: Stock = await this.stockService.updateDato({ usuarioId, dto: dtoStock, qR, id: libro.stock.id, entidadError: 'stock' });

      if (!stock) throw new NotFoundException('No se pudo agregar libros al stock');
      return stock;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar cambiar el stok del libro id ${id}`)
    }
  }

  async agregarStockCx({ usuarioId, dto, id, entidadError, relaciones, selected }: EditarProp<Libro, DtoStockCrear>): Promise<boolean> {
    const qR: QueryRunner = this.dataSource.createQueryRunner();
    await qR.connect();
    await qR.startTransaction();
    try {
      const stock: Stock = await this.agregarStock({ usuarioId, id, dto, entidadError, relaciones, selected, qR });
      await qR.commitTransaction();

      const payload: Mensaje = {
        mensaje: Mens.EDITAR,
        entidad: Entidad.STOCK,
        id: stock.id
      }
      this.gateway.actualizacionDato(payload);

      return true;
    } catch (er) {
      await qR.rollbackTransaction();
      throw this.erroresService.handleExceptions(er, `Error al intentar cambiar el stok del libro id ${id}`)
    } finally {
      await qR.release();
    }
  }

  async quitarStockCx({ usuarioId, dto, id, entidadError, relaciones, selected }: EditarProp<Libro, DtoStockCrear>): Promise<boolean> {
    const qR: QueryRunner = this.dataSource.createQueryRunner();
    await qR.connect();
    await qR.startTransaction();
    try {
      const newDto: DtoStockCrear = {
        stock: dto.stock * (-1)
      }
      const stock: Stock = await this.agregarStock({ usuarioId, id, dto: newDto, entidadError, relaciones, selected, qR });
      await qR.commitTransaction();

      const payload: Mensaje = {
        mensaje: Mens.EDITAR,
        entidad: Entidad.STOCK,
        id: stock.id
      }
      this.gateway.actualizacionDato(payload);

      return true;
    } catch (er) {
      await qR.rollbackTransaction();
      throw this.erroresService.handleExceptions(er, `Error al intentar cambiar el stok del libro id ${id}`)
    } finally {
      await qR.release();
    }
  }
}
