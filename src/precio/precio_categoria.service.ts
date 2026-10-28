import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, ILike, QueryRunner, Raw, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { PrecioCategoria } from './entity/precio_categoria.entity';

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

  async createDato({ dto, qR }: { dto: { nombre: string }; qR: QueryRunner }): Promise<PrecioCategoria> {
    try {
      const nombre = dto.nombre.trim();

      if (!nombre) throw new BadRequestException('El nombre de la categoría no puede estar vacío');

      const categoriaExistente: PrecioCategoria | null = await this.getDatoByNombre({ nombre, qR });

      if (categoriaExistente) return categoriaExistente;

      const categoria: PrecioCategoria = new PrecioCategoria();
      categoria.nombre = nombre;

      const newCategoria: PrecioCategoria = qR
        ? await qR.manager.save(PrecioCategoria, categoria)
        : await this.categoriaRepository.save(categoria);

      return newCategoria;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear la categoria ${dto.nombre}`);
    }
  }
}
