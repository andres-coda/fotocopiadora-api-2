import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, ILike, QueryRunner, Raw, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { PrecioCategoria } from './entity/precio_categoria.entity';
import { PrecioCategoriaUsoRetornoProp } from './retorno/precio.retorno';

@Injectable()
export class PrecioCategoriaService {
  constructor(
    @InjectRepository(PrecioCategoria)
    private readonly categoriaRepository: Repository<PrecioCategoria>,
    @InjectDataSource() private readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
  ) { }

  async getCategorias({ qR, limite = 20, offset = 0, busqueda }: { qR: QueryRunner; limite?: number; offset?: number; busqueda?: string }): Promise<RetornoGenericoServiceGet<PrecioCategoria>> {
    try {
      const criterio: FindManyOptions = {
        order: {
          nombre: 'ASC'
        },
        take: limite,
        skip: offset
      }

      if (busqueda) criterio.where = { nombre: ILike(`%${busqueda}%`) };

      const [datos, total] = await qR.manager.findAndCount(PrecioCategoria, criterio);

      return {
        total,
        datos
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al intentar leer las categorias de precio');
    }
  }

  async getDatoByNombre({ nombre, qR }: { nombre: string; qR: QueryRunner }): Promise<PrecioCategoria | null> {
    try {
      const criterio: FindOneOptions = {
        where: {
          nombre: Raw(alias => `LOWER(${alias}) = LOWER(:nombre)`, {
            nombre,
          }),
        },
      }

      const manager = qR ? qR.manager : this.categoriaRepository;

      return await manager.findOne(PrecioCategoria, criterio);
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer la categoria ${nombre}`);
    }
  }

  /**
   * Categorias que puede ver la empresa, con la marca de uso.
   *
   * `usada` se resuelve contra `precio_empresa` de la empresa actual en vez de
   * confiar en el RLS: funciona igual con o sin RLS activo y no depende de que
   * la politica de `precio_categoria` filtre por join.
   */
  async getCategoriasConUso({ qR }: { qR: QueryRunner }): Promise<PrecioCategoriaUsoRetornoProp[]> {
    try {
      const categorias: PrecioCategoria[] = await qR.manager.find(PrecioCategoria, {
        order: { nombre: 'ASC' },
      });

      const usadas: { id_categoria: string | null }[] = await qR.manager.query(
        `select distinct pe.id_categoria
           from precio_empresa pe
          where pe.id_categoria is not null
            and pe.id_empresa = public.fc_empresa_actual()`,
      );

      const idsUsados = new Set(usadas.map(u => u.id_categoria));

      return categorias.map(categoria => ({
        id: categoria.id,
        nombre: categoria.nombre,
        bloqueado: categoria.bloqueado,
        usada: idsUsados.has(categoria.id),
      }));
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al intentar leer las categorias de precio');
    }
  }

  async createDato({ dto, qR }: { dto: { nombre: string; bloqueado?: boolean }; qR: QueryRunner }): Promise<PrecioCategoria> {
    try {
      const nombre = dto.nombre.trim();

      if (!nombre) throw new BadRequestException('El nombre de la categoría no puede estar vacío');

      const categoriaExistente: PrecioCategoria | null = await this.getDatoByNombre({ nombre, qR });

      if (categoriaExistente) {
        // Solo las categorias por defecto nacen bloqueadas; si ya existian sin
        // estarlo, se las promueve. Ningun otro camino pide `bloqueado`.
        if (dto.bloqueado === true && !categoriaExistente.bloqueado) {
          categoriaExistente.bloqueado = true;
          return qR
            ? await qR.manager.save(PrecioCategoria, categoriaExistente)
            : await this.categoriaRepository.save(categoriaExistente);
        }

        return categoriaExistente;
      }

      const categoria: PrecioCategoria = new PrecioCategoria();
      categoria.nombre = nombre;
      categoria.bloqueado = dto.bloqueado ?? false;

      const newCategoria: PrecioCategoria = qR
        ? await qR.manager.save(PrecioCategoria, categoria)
        : await this.categoriaRepository.save(categoria);

      return newCategoria;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear la categoria ${dto.nombre}`);
    }
  }
}
