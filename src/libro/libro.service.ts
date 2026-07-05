import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DtoLibroCrear } from './dto/libroCrear.dto';
import { DtoLibroEditar } from './dto/libroEditar.dto';
import { Libro } from './entity/libro.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, In, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { DtoLibroEmpresaRespuesta, DtoLibroRespuesta } from './dto/libroRetorno.dto';
import { PropuestaService } from '@src/propuesta_pedido/propuesta_pedido.service';
import { RetornoVistaLibroProp } from './interface/libro.interface';
import { toRespuestaLibro, toRespuestaLibroEmptresXlibro } from './utils/toRespuestaLibro';

interface GetLibroProp {
  limite?: number,
  offset?: number,
  qR: QueryRunner,
}

export interface BuscarLibroProp extends GetLibroProp {
  busqueda: string,
}

interface GetLibroByIdProp {
  id: string;
  qR: QueryRunner,
}

interface GetLibrosByIdsProp {
  ids: string[];
  qR: QueryRunner,
}

interface EditarLibroProp extends GetLibroByIdProp {
  dto: DtoLibroEditar;
  entidad: typeof Entidad.LIBRO
}

interface GetPedidoItemByLibroProp extends GetLibroProp {
  id_libro: string;
}

@Injectable()
export class LibroService {
  constructor(
    @InjectRepository(Libro) private readonly libroRepository: Repository<Libro>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    @Inject(forwardRef(() => PropuestaService))
    private readonly propuestaService: PropuestaService,

  ) { }

  async buscarLibro({ busqueda, limite = 20, offset = 0, qR }: BuscarLibroProp): Promise<DtoLibroRespuesta[]> {
    try {
      const rows = await qR.query(
        `SELECT * FROM fc_busqueda_libro($1, $2, $3)`,
        [busqueda, limite, offset]
      );
      return rows.map((r: RetornoVistaLibroProp) => toRespuestaLibro(r))
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar la busqueda de ${busqueda}`);
    }
  }

  async getLibroCompletoByIdOrdFail({ id, qR }: GetLibroByIdProp): Promise<DtoLibroRespuesta> {
    try {
      const [row]: RetornoVistaLibroProp[] = await qR.query(
        'SELECT * FROM vw_libro_busqueda WHERE id = $1', [id]
      );
      const libro = toRespuestaLibro(row);
      if (!libro) throw new NotFoundException(`Libro ${id} no encontrado`);

      return libro;
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer el libro de id ${id}`);
    }
  }

  async getLibroEmpresaByIdOrdFail({ id, qR }: GetLibroByIdProp): Promise<Libro> {
    try {
      const [row] = await qR.query(
        'SELECT * FROM libro_empresa WHERE id = $1 ',
        [id]
      );
      if (!row) throw new NotFoundException(`Libro ${id} no encontrado`);

      return row;
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer el libro de id ${id}`);
    }
  }

  async getLibrosByIds({ ids, qR }: GetLibrosByIdsProp): Promise<Libro[]> {
    try {
      const criterio: FindManyOptions = {
        where: {
          id: In(ids),
        },
      };
      const libros: Libro[] = await qR.manager.find(Libro, criterio);

      if (libros.length === 0) {
        throw new NotFoundException(`Libros ${ids} no encontrados`);
      }

      if (libros.length < ids.length) {
        throw new NotFoundException(`Algunos libros no fueron encontrados`);
      }

      return libros;
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer los libros por ids`);
    }
  }

  async getLibroEmpresa({ qR, limite, offset }: GetLibroProp): Promise<DtoLibroRespuesta[]> {
    try {
      const rows = await qR.query(
        'SELECT * FROM vw_libro_busqueda WHERE deleted = false ORDER BY pendiente DESC, listo DESC LIMIT $1 OFFSET $2',
        [limite, offset]
      );

      return rows.map((r: RetornoVistaLibroProp) => toRespuestaLibro(r))
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer la pagina de libros ${offset}`);
    }
  }

  async createLibroCompleto({ dto, qR, entidad }: CreateProp<DtoLibroCrear, typeof Entidad.LIBRO>): Promise<DtoLibroRespuesta> {
    try {

      const [rows]: RetornoVistaLibroProp[] = await qR.query(
        'SELECT * FROM fc_crear_libro($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
        [dto.nombre, dto.editorial, dto.materia, dto.cantidadPg, dto.adhesivos, JSON.stringify(dto.especificacionesDefecto ?? []), null, dto.nivel, dto.anio, dto.autor, dto.img, dto.edicion, dto.descripcion, JSON.stringify(dto.componentes ?? [])]
      )

      const libro: DtoLibroRespuesta | undefined = toRespuestaLibro(rows);

      if (!libro) throw new NotFoundException('Error al intentar crear el libro');

      const payload: Mensaje = {
        mensaje: Mens.CREAR,
        entidad: entidad,
        dato: libro
      }

      this.gatewayGateway.actualizacionDato(payload);

      return libro;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateLibroEmpresa({ dto, qR, id, entidad }: EditarLibroProp): Promise<DtoLibroEmpresaRespuesta> {
    try {
      const libro: Libro = await this.getLibroEmpresaByIdOrdFail({ id, qR });

      libro.cantidadPg = dto.cantidadPg ?? libro.cantidadPg;
      libro.adhesivo = dto.adhesivos ?? libro.adhesivo;
      libro.especificacionesDefecto = dto.especificacionesDefecto ?? libro.especificacionesDefecto;

      const newLibro: Libro = qR
        ? await qR.manager.save(Libro, libro)
        : await this.libroRepository.save(libro);

      return toRespuestaLibroEmptresXlibro(newLibro);

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de libros`)
    }
  }

  async updateLibroCompleto({ dto, qR, id }: EditarLibroProp): Promise<DtoLibroRespuesta> {
    await qR.query(
      `UPDATE libro_completo SET
       anio        = COALESCE($2, anio),
       autor       = COALESCE($3, autor),
       img         = COALESCE($4, img),
       edicion     = COALESCE($5, edicion),
       descripcion = COALESCE($6, descripcion),
       id_nivel    = COALESCE(
         (SELECT id FROM nivel WHERE nombre = $7), id_nivel
       )
     WHERE id = $1`,
      [id, dto.anio, dto.autor, dto.img, dto.edicion, dto.descripcion, dto.nivel]
    );

    return this.getLibroCompletoByIdOrdFail({ id, qR });
  }

  async deleteLibroEmpresa({ id, qR }: GetLibroByIdProp): Promise<boolean> {
    try {
      const libro: Libro = await this.getLibroEmpresaByIdOrdFail({ id, qR });
      if (libro.deleted) throw new NotFoundException('El libro no existe, no se puede eliminar');

      libro.deleted = true;
      const newLibro = await qR.manager.save(Libro, libro);
      if (!newLibro) throw new NotFoundException(`No se pudo eliminar el libro id ${id}`);
      return true;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar eliminar el libro ${id}`)
    }
  }
}
