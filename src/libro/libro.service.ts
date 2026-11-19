import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DtoLibroCrear } from './dto/libroCrear.dto';
import { DtoLibroEditar, DtoLibroExtraEditar, DtoLibroPrincipalEditar } from './dto/libroEditar.dto';
import { Libro } from './entity/libro.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, In, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { PropuestaService } from '@src/propuesta_pedido/propuesta_pedido.service';
import { RetornoLibroNombreProp, RetornoVistaLibroCompletoProp, RetornoVistaLibroProp } from './interface/libro.interface';
import { toRespuestaLibro, toRespuestaLibroCompleto, toRespuestaLibroEmptresXlibro, toRespuestaLibroNombre } from './utils/toRespuestaLibro';
import { BusquedaGenericoProp, CreateGenericoProp, GetGenericoByIdProp, GetGenericoProp, RetornoGenericoServiceGet, UpdateGenericoProp } from '@src/interface/general.interface';
import { LibroRetorno } from './retorno/libro.retorno';

interface GetLibroProp {
  limite?: number,
  offset?: number,
  qR: QueryRunner,
}

export interface BuscarLibroProp extends GetLibroProp {
  busqueda: string,
}

interface BusquedaLibroCompletoProp extends Omit<BusquedaGenericoProp, 'busqueda'> {
  id: string;
  componentes?: string;
  nivel?: string;
}

interface GetLibrosByIdsProp {
  ids: string[];
  qR: QueryRunner,
}

interface EditarLibroExtraProp extends UpdateGenericoProp<DtoLibroExtraEditar> {
  id_usuario: string;
  id_empresa: string;
}

interface LibroExtraProp {
  autor?: string;
  edicion?: string;
  anio?: string;
  img?: string;
  descripcion?: string;
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

  /** Una falla de socket no debe romper ni revertir un cambio de base ya hecho. */
  private emitirSeguro(payload: Mensaje): void {
    try {
      this.gatewayGateway.actualizacionDato(payload);
    } catch (error) {
      console.error('No se pudo emitir la actualizacion de libro por socket', error);
    }
  }

  private emitirSeguroEmpresas(payload: Mensaje, idsEmpresa: string[]): void {
    try {
      this.gatewayGateway.actualizacionDatoEmpresas(payload, idsEmpresa);
    } catch (error) {
      console.error('No se pudo emitir la actualizacion de libro por socket', error);
    }
  }

  /** Emite el libro editado a cada empresa que lo ve, mas la sala super. */
  private async emitirLibroEditado(qR: QueryRunner, idLibroCompleto: string): Promise<void> {
    try {
      const filas: RetornoVistaLibroProp[] = await qR.manager.query(
        `select * from vw_libro_busqueda where id = $1`,
        [idLibroCompleto],
      );

      for (const fila of filas) {
        const libro = toRespuestaLibro(fila);
        if (!libro || !fila.id_empresa) continue;

        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad: Entidad.LIBRO,
          dato: libro,
        };

        this.emitirSeguroEmpresas(payload, [fila.id_empresa]);
      }
    } catch (error) {
      console.error('No se pudo emitir la actualizacion de libro por socket', error);
    }
  }

  /** fc_procesar_actualizacion_libro_completo siempre devuelve true: solo el diff dice si hubo update directo. */
  private cambioLibroCompleto(antes: LibroRetorno, despues: LibroRetorno): boolean {
    const campos: (keyof LibroRetorno)[] = ['autor', 'edicion', 'anio', 'img', 'descripcion'];

    return campos.some((campo) => (antes[campo] ?? null) !== (despues[campo] ?? null));
  }

  async buscarLibroNombre({ busqueda, limite = 20, offset = 0, qR }: BusquedaGenericoProp): Promise<RetornoGenericoServiceGet<LibroRetorno>> {
    try {
      const rows = await qR.query(
        "SELECT *, count(*) over() AS total FROM vw_libro_nombre WHERE nombre ILIKE '%' || $1 || '%' ORDER BY nombre LIMIT $2 OFFSET $3",
        [busqueda, limite, offset]
      )

      if (!rows || rows.length === 0) return {
        total: 0,
        datos: []
      };
      const newDatos = rows
        .map((r: RetornoLibroNombreProp) => toRespuestaLibroNombre(r))
        .filter((d: LibroRetorno) => d !== undefined);

      return {
        total: rows[0].total,
        datos: newDatos
      }
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar la busqueda de ${busqueda}`);
    }
  }


  async buscarLibroCompleto({ id, nivel, componentes, limite = 20, offset = 0, qR }: BusquedaLibroCompletoProp): Promise<RetornoGenericoServiceGet<LibroRetorno>> {
    try {
      const filtros: (string | number)[] = [id];

      let where = `WHERE id_libro_nombre = $1`;

      if (componentes) {
        filtros.push(componentes);
        where += ` AND componentes = $${filtros.length}`;
      }

      if (nivel) {
        filtros.push(nivel);
        where += ` AND nivel = $${filtros.length}`;
      }

      // El total se cuenta aparte y no depende de las filas de la pagina. Con
      // `count(*) OVER()` el total viajaba dentro de cada fila: si el OFFSET caia
      // mas alla del final, la pagina volvia vacia y el total se reportaba como 0.
      const totalRows = await qR.query(
        `SELECT count(*)::int AS total FROM vw_libro_completo ${where}`,
        filtros
      );
      const total = Number(totalRows?.[0]?.total ?? 0);

      if (total === 0) return { total: 0, datos: [] };

      // ORDER BY explicito: LIMIT/OFFSET sin orden no es determinista, dos
      // paginas consecutivas pueden repetir o saltear filas.
      const rows = await qR.query(
        `SELECT * FROM vw_libro_completo ${where}
         ORDER BY nivel, componentes, id
         LIMIT $${filtros.length + 1} OFFSET $${filtros.length + 2}`,
        [...filtros, Number(limite), Number(offset)]
      );

      return {
        total,
        datos: rows.map((r: RetornoVistaLibroCompletoProp) => toRespuestaLibroCompleto(r))
      }
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar la busqueda de libros con id ${id}`);
    }
  }

  async buscarLibroCompletoSuper({ busqueda, limite = 20, offset = 0, qR }: BusquedaGenericoProp): Promise<RetornoGenericoServiceGet<LibroRetorno>> {
    try {
      const rows = await qR.query(
        `SELECT * FROM fc_busqueda_libro_completo($1, $2, $3)`,
        [busqueda, limite, offset]
      );
      return {
        total: Number(rows[0]?.total ?? 0),
        datos: rows.map((r: RetornoVistaLibroCompletoProp) => toRespuestaLibroCompleto(r))
      }
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar la busqueda de ${busqueda}`);
    }
  }

  async buscarLibro({ busqueda, limite = 20, offset = 0, qR }: BusquedaGenericoProp): Promise<RetornoGenericoServiceGet<LibroRetorno>> {
    try {
      const rows = await qR.query(
        `SELECT * FROM fc_busqueda_libro($1, $2, $3)`,
        [busqueda, limite, offset]
      );
      return {
        total: Number(rows[0]?.total ?? 0),
        datos: rows.map((r: RetornoVistaLibroProp) => toRespuestaLibro(r))
      }
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar la busqueda de ${busqueda}`);
    }
  }

  async getLibroCompletoByIdOrdFail({ id, qR }: GetGenericoByIdProp): Promise<LibroRetorno> {
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

  async getLibroEmpresaByIdOrdFail({ id, qR }: GetGenericoByIdProp): Promise<Libro> {
    try {
      const [row] = await qR.query(
        'SELECT * FROM libro_empresa WHERE id_libro = $1 ',
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
          id_libro: In(ids),
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

  async getLibroEmpresa({ qR, limite, offset }: GetGenericoProp): Promise<RetornoGenericoServiceGet<LibroRetorno>> {
    try {

      const [totalR] = await qR.query(
        'SELECT COUNT(*) as total FROM vw_libro_busqueda WHERE deleted = false'
      );

      const rows = await qR.query(
        'SELECT * FROM vw_libro_busqueda WHERE deleted = false ORDER BY nombre ASC, nivel ASC LIMIT $1 OFFSET $2',
        [Number(limite), Number(offset)]
      );

      return {
        total: totalR.total,
        datos: rows.map((r: RetornoVistaLibroProp) => toRespuestaLibro(r))
      }

    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer la pagina de libros ${offset}`);
    }
  }

  async getLibroEmpresaSupre({ qR, limite, offset }: GetGenericoProp): Promise<RetornoGenericoServiceGet<LibroRetorno>> {
    try {
      const [totalR] = await qR.query(
        'SELECT COUNT(*) as total FROM vw_libro_completo'
      );

      const rows = await qR.query(
        'SELECT * FROM vw_libro_completo ORDER BY nombre ASC, nivel, componentes, id ASC LIMIT $1 OFFSET $2',
        [Number(limite), Number(offset)]
      );

      return {
        total: totalR.total,
        datos: rows.map((r: RetornoVistaLibroProp) => toRespuestaLibro(r))
      }

    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer la pagina de libros ${offset}`);
    }
  }

  async createLibroCompleto({ dto, qR }: CreateGenericoProp<DtoLibroCrear>): Promise<LibroRetorno> {
    try {

      // El alta sin edicion escrita guarda '1': la edicion vacia solo tiene
      // sentido en el formulario, no como texto suelto en el catalogo.
      const [rows]: RetornoVistaLibroProp[] = await qR.query(
        'SELECT * FROM fc_crear_libro($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
        [dto.nombre, dto.editorial, dto.materia, dto.cantidadPg, dto.adhesivos ?? 0, JSON.stringify(dto.especificacionesDefecto ?? []), dto.id_libro_completo ?? null, dto.nivel, dto.anio, dto.autor, dto.img, dto.edicion ?? '1', dto.descripcion, JSON.stringify(dto.componentes ?? [])]
      )

      const libro: LibroRetorno | undefined = toRespuestaLibro(rows);

      if (!libro) throw new NotFoundException('Error al intentar crear el libro');

      const payload: Mensaje = {
        mensaje: Mens.CREAR,
        entidad: Entidad.LIBRO,
        dato: libro
      }

      this.gatewayGateway.actualizacionDato(payload);

      return libro;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el libro ${dto.nombre} en crear libro completo`)
    }
  }

  async updateLibroEmpresa({ dto, qR, id }: UpdateGenericoProp<DtoLibroEditar>): Promise<LibroRetorno> {
    try {
      const libro: Libro = await this.getLibroEmpresaByIdOrdFail({ id, qR });

      libro.cantidad_pg = dto.cantidadPg ?? libro.cantidad_pg;
      libro.cantidad_adhesivo = dto.adhesivos ?? libro.cantidad_adhesivo;
      libro.especificaciones_defecto = dto.especificacionesDefecto ?? libro.especificaciones_defecto;

      const newLibro: Libro = await qR.manager.save(Libro, libro)

      const libroActualizado = await this.getLibroCompletoByIdOrdFail({ id: newLibro.id_libro, qR });

      this.emitirSeguro({
        mensaje: Mens.EDITAR,
        entidad: Entidad.LIBRO,
        dato: libroActualizado,
      });

      return libroActualizado;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de libros`)
    }
  }

  async updateLibroCompleto({ dto, qR, id }: UpdateGenericoProp<DtoLibroEditar>): Promise<LibroRetorno> {
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

    const libroActualizado = await this.getLibroCompletoByIdOrdFail({ id, qR });

    await this.emitirLibroEditado(qR, id);

    return libroActualizado;
  }

  async updateLibroExtra({ dto, qR, id, id_empresa, id_usuario }: EditarLibroExtraProp): Promise<LibroRetorno> {
    try {

      const libroAntes = await this.getLibroCompletoByIdOrdFail({ id, qR });

      const [row]: LibroExtraProp[] = await qR.query(
        `select * from fc_procesar_actualizacion_libro_completo(
          $1, $2, $3, $4, $5, $6)
          `,
        [id, dto.autor, dto.edicion, dto.anio, dto.img, dto.descripcion]
      );

      const libroDespues = await this.getLibroCompletoByIdOrdFail({ id, qR });

      // Si la funcion creo una peticion en lugar de actualizar el libro compartido,
      // nada se emite a proposito: el libro no cambio.
      if (this.cambioLibroCompleto(libroAntes, libroDespues)) {
        await this.emitirLibroEditado(qR, id);
      }

      return libroDespues;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el libro ${id} en el registro de libros`)
    }
  }

  async updateLibroPrincipal({ dto, qR, id }: UpdateGenericoProp<DtoLibroPrincipalEditar>): Promise<boolean> {
    try {
      const [row]: boolean[] = await qR.query(
        `select * from fc_procesar_actualizacion_libro(
          $1, $2, $3, $4, $5, $6)
          `,
        [id, dto.nombre, dto.materia, dto.editorial, dto.nivel, dto.componentes]
      );

      // Solo crea una solicitud: el libro no cambia, emitir confundiria a la interfaz.
      return row;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el libro ${id} en el registro de libros`)
    }
  }

  async deleteLibroEmpresa({ id, qR }: GetGenericoByIdProp): Promise<boolean> {
    try {
      const libro: Libro = await this.getLibroEmpresaByIdOrdFail({ id, qR });
      if (libro.deleted) throw new NotFoundException('El libro no existe, no se puede eliminar');

      libro.deleted = true;
      const newLibro = await qR.manager.save(Libro, libro);
      if (!newLibro) throw new NotFoundException(`No se pudo eliminar el libro id ${id}`);

      this.emitirSeguro({
        mensaje: Mens.ELIMINAR,
        entidad: Entidad.LIBRO,
        id,
      });

      return true;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar eliminar el libro ${id}`)
    }
  }
}
