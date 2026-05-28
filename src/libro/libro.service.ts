import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { DtoLibroCrear } from './dto/libroCrear.dto';
import { DtoLibroEditar } from './dto/libroEditar.dto';
import { Libro } from './entity/libro.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, GetDatoProp, UpdateRetorno } from '../base/interface/base.interface';
import { LIBRO_RELATIONS, SELECTED_LIBRO } from './default/relacion.default';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { MateriaService } from '../materia/materia.service';
import { Materia } from '../materia/entity/materia.entity';
import { StockService } from '../stock/stock.service';
import { DtoStockCrear } from '../stock/dto/stockCrear.dto';
import { Stock } from '../stock/entity/stock.entity';
import { DtoStockEditar } from '../stock/dto/stockEditar.dto';
import { Estado } from '../interface/estado.interface';
import { Componente } from '../componente/entity/componente.entity';
import { ComponenteService } from '../componente/componente.service';
import { COMPONENTE_RELATIONS, SELECTED_COMPONENTE } from '../componente/default/relacion.default';
import { DtoLibroRespuesta } from './dto/libroRetorno.dto';
import { DtoBaseRetorno } from '../base/dto/baseRetorno.dto';
import { DtoComponenteRespuesta } from '../componente/dto/componenteRetorno.dto';
import { DtoMateriaRespuesta } from '../materia/dto/materiaRetorno.dto';
import { DtoStockRespuesta } from '../stock/dto/stockRetorno.dto';
import { DtoPropuestaLibroRetorno } from '@src/propuesta_pedido/dto/propuestaRetorno.dto';
import { PropuestaService } from '@src/propuesta_pedido/propuesta_pedido.service';



@Injectable()
export class LibroService extends BaseService<typeof Entidad.LIBRO, Libro, DtoLibroCrear, DtoLibroEditar> {
  constructor(
    @InjectRepository(Libro) private readonly libroRepository: Repository<Libro>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    private readonly materiaService: MateriaService,
    private readonly stockService: StockService,
    private readonly componenteService: ComponenteService,
    @Inject(forwardRef(() => PropuestaService))
    private readonly propuestaService: PropuestaService,

  ) {
    super(libroRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ usuario, dto, qR, entidad }: CreateProp<DtoLibroCrear, typeof Entidad.LIBRO>): Promise<Libro> {
    try {
      const libroExiste: Libro | null = await this.getDatoByName({
        dato: dto.nombre,
        usuarioId: usuario.id,
        qR,
        relaciones: [LIBRO_RELATIONS],
        selected: SELECTED_LIBRO,
        entidadError: 'libro'
      });

      if (libroExiste) {
        const normalize = (s: string) => s.toLowerCase().trim();

        const setLibro = new Set(
          libroExiste.componentes.map(c => normalize(c.nombre))
        );

        const setDto = new Set(
          (dto.componentes ?? []).map(normalize)
        );

        const mismosComponentes =
          setLibro.size === setDto.size &&
          [...setLibro].every(nombre => setDto.has(nombre));

        const mismoNivel = libroExiste.nivel === dto.nivel;

        if (mismosComponentes && mismoNivel) {
          return libroExiste;
        }
      }

      const componentes: Componente[] = await this.componenteService.getDatosByNombres({
        nombres: dto.componentes ?? [],
        usuarioId: usuario.id,
        qR,
        entidadError: 'componente',
        relaciones: [COMPONENTE_RELATIONS],
        selected: SELECTED_COMPONENTE
      });

      const materia: Materia = await this.materiaService.createDato({
        usuario,
        dto: { nombre: dto.materia },
        qR,
        entidad: Entidad.MATERIA,
      });

      const dtoStock: DtoStockCrear = { stock: 0 };

      const stock: Stock = await this.stockService.createDato({ usuario, qR, dto: dtoStock, entidad: Entidad.STOCK })

      const libro: Libro = new Libro();
      libro.nombre = dto.nombre;
      libro.descripcion = dto.descripcion ?? undefined;
      libro.editorial = dto.editorial ?? undefined;
      libro.edicion = dto.edicion ?? undefined;
      libro.nivel = dto.nivel ?? undefined;
      libro.cantidadPg = dto.cantidadPg ?? 0;
      libro.anio = dto.anio ?? undefined;
      libro.adhesivo = dto.adhesivos ?? undefined;
      libro.autor = dto.autor ?? undefined;
      libro.img = dto.img ?? undefined;
      libro.especificacionesDefecto = dto.especificacionesDefecto ?? undefined;
      libro.materia = materia;
      libro.stock = stock;
      libro.componentes = componentes;
      libro.user = usuario;

      const newLibro: Libro = qR
        ? await qR.manager.save(Libro, libro)
        : await this.libroRepository.save(libro);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad: entidad,
          dato: newLibro
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return newLibro;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Libro, DtoLibroEditar, typeof Entidad.LIBRO>): Promise<UpdateRetorno<Libro>> {
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

      libro.nombre = dto.nombre ?? libro.nombre;
      libro.descripcion = dto.descripcion ?? libro.descripcion;
      libro.editorial = dto.editorial ?? libro.editorial;
      libro.edicion = dto.edicion ?? libro.edicion;
      libro.nivel = dto.nivel ?? libro.nivel;
      libro.cantidadPg = dto.cantidadPg ?? libro.cantidadPg;
      libro.anio = dto.anio ?? libro.anio;
      libro.adhesivo = dto.adhesivos ?? libro.adhesivo;
      libro.autor = dto.autor ?? libro.autor;
      libro.img = dto.img ?? libro.img;
      libro.especificacionesDefecto = dto.especificacionesDefecto ?? libro.especificacionesDefecto;
      libro.materia = materia;

      const newLibro: Libro = qR
        ? await qR.manager.save(Libro, libro)
        : await this.libroRepository.save(libro);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad: entidad,
          dato: newLibro
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return { dato: libro, isQr: true };

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de libros`)
    }
  }

  async agregarStock({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Libro, DtoStockCrear, typeof Entidad.STOCK>): Promise<Stock> {
    try {
      const libro: Libro = await this.getDatoByIdOrFail({ id, qR, relaciones, entidadError, selected, usuarioId });
      const dtoStock: DtoStockEditar = {
        anterior: Estado.CANCELADO,
        actual: Estado.STOCK,
        cantidad: dto.stock
      }
      const stock: UpdateRetorno<Stock> = await this.stockService.updateDato({ usuarioId, dto: dtoStock, qR, id: libro.stock.id, entidadError: 'stock', entidad });

      if (!stock?.dato) throw new NotFoundException('No se pudo agregar libros al stock');
      return stock.dato;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar cambiar el stok del libro id ${id}`)
    }
  }

  async agregarStockCx({ usuarioId, dto, id, entidadError, relaciones, selected, entidad }: EditarProp<Libro, DtoStockCrear, typeof Entidad.STOCK>): Promise<boolean> {
    const qR: QueryRunner = this.dataSource.createQueryRunner();
    await qR.connect();
    await qR.startTransaction();
    try {
      const stock: Stock = await this.agregarStock({ usuarioId, id, dto, entidadError, relaciones, selected, qR, entidad });
      await qR.commitTransaction();

      const payload: Mensaje = {
        mensaje: Mens.EDITAR,
        entidad: entidad,
        dato: stock
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

  async quitarStockCx({ usuarioId, dto, id, entidadError, relaciones, selected, entidad }: EditarProp<Libro, DtoStockCrear, typeof Entidad.STOCK>): Promise<boolean> {
    const qR: QueryRunner = this.dataSource.createQueryRunner();
    await qR.connect();
    await qR.startTransaction();
    try {
      const newDto: DtoStockCrear = {
        stock: dto.stock * (-1)
      }
      const stock: Stock = await this.agregarStock({ usuarioId, id, dto: newDto, entidadError, relaciones, selected, qR, entidad });
      await qR.commitTransaction();

      const payload: Mensaje = {
        mensaje: Mens.EDITAR,
        entidad: entidad,
        dato: stock
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

  remplaceToReturn(entidad: Libro): DtoLibroRespuesta {
    const base: DtoBaseRetorno = this.remplaceToBase(entidad);
    const componentes: DtoComponenteRespuesta[] = entidad.componentes?.length > 0
      ? entidad.componentes.map(c => this.componenteService.remplaceToReturn(c))
      : [];

    const materia: DtoMateriaRespuesta | undefined= entidad.materia ? this.materiaService.remplaceToReturn(entidad.materia) : undefined;
    const stock: DtoStockRespuesta | undefined = entidad.stock ? this.stockService.remplaceToReturn(entidad.stock) : undefined;
    const propuesta: DtoPropuestaLibroRetorno[] = entidad.propuesta?.length > 0
      ? entidad.propuesta.map(p => this.propuestaService.remplaceToReturn(p))
      : [];

    return {
      ...base,
      nombre: entidad.nombre,
      descripcion: entidad.descripcion,
      editorial: entidad.editorial,
      edicion: entidad.edicion,
      nivel: entidad.nivel,
      cantidadPg: entidad.cantidadPg,
      anio: entidad.anio,
      adhesivos: entidad.adhesivo,
      autor: entidad.autor,
      img: entidad.img,
      especificacionesDefecto: entidad.especificacionesDefecto,

      componentes,
      materia,
      stock,
      propuesta
    }
  }
}
