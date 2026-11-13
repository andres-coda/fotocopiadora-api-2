import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, ILike, In, QueryRunner, Repository } from 'typeorm';
import { PrecioEmpresa } from './entity/precio_empresa.entity';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { DtoPrecioEmpresaCrear, DtoPrecioEmpresaEditar } from './dto/precio_empresa.dto';
import { Entidad, Mensaje } from '@src/gateway/dto/gatewayDto.dto';
import { Mens } from '@src/gateway/enum/Mens.enum';
import { PrecioService } from './precio.service';
import { Precio } from './entity/precio.entity';
import { PrecioCategoria } from './entity/precio_categoria.entity';
import { PrecioCategoriaService } from './precio_categoria.service';
import { BusquedaGenericoProp, CreateGenericoProp, GetGenericoByIdProp, GetGenericoProp, RetornoGenericoServiceGet, UpdateGenericoProp } from '@src/interface/general.interface';
import { PrecioDefaultProp } from './interface/precio.interface';
import { PrecioRetorno } from './retorno/precio.retorno';
import { CATEGORIAS_PRECIO_DEFAULT_LISTA } from './default/precio.default';

/** Filtros opcionales de la lista de precios de la empresa. */
interface PrecioEmpresaFiltroProp {
  /** Solo precios de categorias bloqueadas: es la carga inicial del lateral. */
  bloqueado?: boolean;
  /** Ids de categoria a los que restringir la busqueda. */
  categorias?: string[];
}


@Injectable()
export class PrecioEmpresaService {
  constructor(
    @InjectRepository(PrecioEmpresa)
    private readonly precioEmpresaRepo: Repository<PrecioEmpresa>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly erroresService: ErroresService,
    private readonly gateway: GatewayGateway,
    private readonly precioService: PrecioService,
    private readonly precioCategoriaService: PrecioCategoriaService
  ) { }

  /**
   * Filtro por categoria para las dos ramas de la busqueda.
   * Devuelve `undefined` cuando no hay nada que filtrar, para no anidar un
   * `where` vacio en TypeORM.
   */
  private filtroCategoria({ bloqueado, categorias }: PrecioEmpresaFiltroProp): Record<string, unknown> | undefined {
    const filtro: Record<string, unknown> = {};
    if (bloqueado) filtro.bloqueado = true;
    if (categorias?.length) filtro.id = In(categorias);
    return Object.keys(filtro).length ? filtro : undefined;
  }

  /**
   * Devuelve todos los precios de la empresa actual.
   * El RLS filtra automáticamente por id_empresa.
   * Hace join con precio para traer nombre y descripcion.
   */
  async getPreciosEmpresa({ qR, limite, offset, bloqueado, categorias }: GetGenericoProp & PrecioEmpresaFiltroProp): Promise<RetornoGenericoServiceGet<PrecioRetorno>> {
    try {
      const categoria = this.filtroCategoria({ bloqueado, categorias });

      const criterio: FindManyOptions = {
        relations: ['precio', 'categoria'],
        order: { precio: { abreviatura: 'ASC' } },
        take: limite ?? 20,
        skip: offset ?? 0,
        ...(categoria && { where: { categoria } }),
      }

      const [datos, total] = await qR.manager.findAndCount(PrecioEmpresa, criterio);

      return {
        total,
        datos: datos.map((pe) => this.toRespuesta(pe))
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al leer precios de la empresa');
    }
  }

  async getPreciosEmpresaBusqueda({ qR, limite, offset, busqueda, bloqueado, categorias }: BusquedaGenericoProp & PrecioEmpresaFiltroProp): Promise<RetornoGenericoServiceGet<PrecioRetorno>> {
    try {
      const categoria = this.filtroCategoria({ bloqueado, categorias });

      const criterio: FindManyOptions = {
        relations: ['precio', 'categoria'],
        where: {
          precio: {
            nombre: ILike(`%${busqueda}%`)
          },
          ...(categoria && { categoria }),
        },
        take: limite ?? 20,
        skip: offset ?? 0
      }

      const [datos, total] = await qR.manager.findAndCount(PrecioEmpresa, criterio);

      return {
        total,
        datos: datos.map((pe) => this.toRespuesta(pe))
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, 'Error al leer precios de la empresa');
    }
  }

  /**
   * Busca un precio de empresa por idPrecio.
   * RLS garantiza que solo se accede al de la empresa actual.
   */
  async getPrecioEmpresaByIdOrFail({ id, qR }: GetGenericoByIdProp): Promise<PrecioEmpresa> {
    try {
      const criterio: FindOneOptions = {
        relations: ['precio', 'categoria'],
        where: { id_precio: id }
      }

      const precio = await qR.manager.findOne(PrecioEmpresa, criterio);

      if (!precio) throw new NotFoundException(`No se encontró el precio ${id} para esta empresa`);

      return precio;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al leer precio ${id}`);
    }
  }

  async getPrecioEmpresaByIdOrFailCx({ id, qR }: GetGenericoByIdProp): Promise<PrecioRetorno> {
    try {
      const precio: PrecioEmpresa = await this.getPrecioEmpresaByIdOrFail({ qR, id });

      return this.toRespuesta(precio)
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al leer precio ${id}`);
    }
  }

  /**
   * Crea un precio para la empresa actual.
   * id_empresa lo inyecta PostgreSQL via RLS / DEFAULT fc_empresa_actual().
   * Si la BD no tiene DEFAULT, obtenemos el id_empresa del GUC:
   *   SELECT current_setting('app.empresa_id')
   */
  async createPrecioEmpresa({ dto, qR }: CreateGenericoProp<DtoPrecioEmpresaCrear>): Promise<PrecioRetorno> {
    try {

      let precio: Precio | null = await this.precioService.getDatoByName({
        id: dto.nombre,
        qR,
      });

      if (!precio) {
        precio = await this.precioService.createDato({ dto, qR });
      }

      const pe = new PrecioEmpresa();
      pe.id_precio = precio.id;
      pe.importe = dto.importe;
      pe.detalles = dto.detalles;
      if (dto.idEmpresa) pe.id_empresa = dto.idEmpresa;

      const categoria = await this.resolverCategoria({ categoria: dto.categoria, qR });
      if (categoria) pe.id_categoria = categoria.id;

      const saved = await qR.manager.save(PrecioEmpresa, pe);
      const newPrecio: PrecioEmpresa = {
        ...saved,
        precio,
        categoria: categoria ?? undefined
      }

      const retorno = this.toRespuesta(newPrecio!);

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

  async updatePrecioEmpresa({ id, dto, qR }: UpdateGenericoProp<DtoPrecioEmpresaEditar>): Promise<PrecioRetorno> {
    try {
      let precio: Precio | undefined;
      if (dto.nombre) {
        precio = await this.precioService.updateDato({
          dto: { nombre: dto.nombre },
          qR,
          id
        })
      }

      const pe = await this.getPrecioEmpresaByIdOrFail({ id, qR });

      if (dto.importe !== undefined) pe.importe = dto.importe;
      if (dto.detalles !== undefined) pe.detalles = dto.detalles;

      let categoria: PrecioCategoria | null | undefined = pe.categoria;

      if (dto.categoria !== undefined) {
        categoria = await this.resolverCategoria({ categoria: dto.categoria, qR });
        pe.id_categoria = categoria?.id ?? null;
        pe.categoria = categoria ?? undefined;
      }

      const saved = await qR.manager.save(PrecioEmpresa, pe);
      const retorno = this.toRespuesta({ ...pe, ...saved, categoria: categoria ?? undefined });

      this.gateway.actualizacionDato({
        mensaje: Mens.EDITAR,
        entidad: Entidad.PRECIO,
        dato: retorno,
      } as Mensaje);

      return retorno;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al editar precio ${id}`);
    }
  }

  async deletePrecioEmpresa({ id, qR }: GetGenericoByIdProp): Promise<boolean> {
    try {
      const pe = await this.getPrecioEmpresaByIdOrFail({ id, qR });

      await qR.manager.remove(PrecioEmpresa, pe);

      this.gateway.actualizacionDato({
        mensaje: Mens.ELIMINAR,
        entidad: Entidad.PRECIO,
        id: id,
      } as Mensaje);

      return true;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al eliminar precio ${id}`);
    }
  }

  async CreatePrecioDefault(preciosDefault: PrecioDefaultProp[], qR:QueryRunner, idEmpresa:string):Promise<PrecioRetorno[]>{
    try{
      // Las categorias por defecto existen desde que nace la empresa y son las
      // unicas bloqueadas: el lateral y la carga inicial de precios dependen de
      // que cada precio por defecto tenga su categoria asignada.
      for(const nombre of CATEGORIAS_PRECIO_DEFAULT_LISTA) {
        await this.precioCategoriaService.createDato({ dto: { nombre, bloqueado: true }, qR });
      }

      const preciosCreados:PrecioRetorno[] = [];
      for(const p of preciosDefault) {
        let aux:Precio | null= null;
        if(p.abreviatura) aux = await this.precioService.getDatoByAbrev({id:p.abreviatura, qR});
        
        if(!aux) {
          aux = await this.precioService.createDato({dto: {nombre:p.nombre, abreviatura:p.abreviatura}, qR});
        }
        const precioCompleto:PrecioRetorno = await this.createPrecioEmpresa({dto:{nombre:p.nombre, importe:p.importe, idEmpresa, categoria:p.categoria}, qR});
        preciosCreados.push(precioCompleto);
      }
      return preciosCreados;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al crear por defecto los precios`);
    }
  }

  private async resolverCategoria({ categoria, qR }: { categoria?: string; qR: QueryRunner }): Promise<PrecioCategoria | null> {
    if (categoria === undefined || !categoria.trim()) return null;

    return this.precioCategoriaService.createDato({ dto: { nombre: categoria }, qR });
  }

  private toRespuesta(pe: PrecioEmpresa): PrecioRetorno {
    const precio = new PrecioRetorno({
      ...pe, 
      abreviatura: pe.precio?.abreviatura,
      descripcion: pe.precio?.descripcion,
      nombre: pe.precio?.nombre ?? '',
      idPrecio: pe.id_precio,
      categoria: pe.categoria
        ? { id: pe.categoria.id, nombre: pe.categoria.nombre }
        : undefined,
    })
    return precio;
  }
}
