import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateDefaultProp, CreateProp, EditarProp, GetIdProp, GetProp, RetornoGet, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Propuesta } from './entity/propuesta_pedido.entity';
import { DtoPropuestaCrear } from './dto/propuesta_pedidoCrear.dto';
import { DtoPropuestaEditar } from './dto/propuesta_pedidoEditar.dto';
import { Libro } from '../libro/entity/libro.entity';
import { LibroService } from '../libro/libro.service';
import { DtoPropuestaRespuesta } from './dto/propuestaRetorno.dto';
import { DtoBaseRetorno } from '../base/dto/baseRetorno.dto';
import { toRespuestaPropuesta } from './utils/toRespuestaPropuesta';
import { BusquedaGenericoProp, GetGenericoByIdProp, GetGenericoProp, RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { PropuestaVistaProp } from './interface/propuesta.interface';

interface GetTotalIdsProp {
  total: number;
  id: string;
}

interface QuitarLibrosProp extends GetGenericoByIdProp{
  id_libros: string[];
}


@Injectable()
export class PropuestaService extends BaseService<typeof Entidad.PROPUESTA_PEDIDO, Propuesta, DtoPropuestaCrear, DtoPropuestaEditar> {
  constructor(
    @InjectRepository(Propuesta) private readonly propuestaRepository: Repository<Propuesta>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    @Inject(forwardRef(() => LibroService))
    private readonly libroService: LibroService,
  ) {
    super(propuestaRepository, dataSource, erroresService, gatewayGateway)
  }

  async getPropuesta({ qR, limite, offset, orden }: GetGenericoProp): Promise<{ datos: DtoPropuestaRespuesta[], total: number }> {
    try {
      const ordenSql = orden === 'DESC' ? 'DESC' : 'ASC';

      const total: GetTotalIdsProp[] = await qR.query(
        `SELECT id, count(*) over() as total 
        from propuesta 
        order by nombre ${ordenSql} 
        limit $1 offset $2`,
        [limite, offset]
      );

      if (total.length === 0) return { datos: [], total: 0 }
      const ids: string[] = total.map(t => t.id);

      const row: PropuestaVistaProp[] = await qR.query(
        `SELECT * 
        from vw_propuesta
        where id_propuesta = ANY($1::uuid[])`,
        [ids]
      )

      return {
        datos: toRespuestaPropuesta(row),
        total: total[0].total,
      };
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer las propusetas`)
    }
  }

  async getDatoCx({ qR, entidadError = 'Propuesta', limite = 50, offset = 0 }: GetProp<Propuesta>): Promise<RetornoGet<'propuesta_pedido'>> {
    try {
      const find: { datos: DtoPropuestaRespuesta[], total: number } = await this.getPropuesta({ qR, limite, offset });

      return {
        total: find.total,
        limite: limite,
        pagina: offset + 1,
        datos: find.datos,
      };
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer todos los  ${entidadError} de la base de datos`)
    }
  }

  async getPropuestaById({ qR, id }: GetGenericoByIdProp): Promise<DtoPropuestaRespuesta> {
    try {
      const rows = await qR.query(
        'SELECT * FROM vw_propuesta WHERE id_propuesta = $1 ORDER BY nombre',
        [id]
      );

      const propuesta = toRespuestaPropuesta(rows);
      if (propuesta.length != 1) throw new NotFoundException('Hay propuesta con id duplicadas');
      return propuesta[0];
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer las propusetas`)
    }
  }

  async getDatoByIdCx({ id, qR, relaciones, entidadError, selected }: GetIdProp<Propuesta>): Promise<DtoPropuestaRespuesta> {
    try {
      return await this.getPropuestaById({id, qR});
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer la propusetas ${id}`)
    }
  }

  async buscarPropuesta({busqueda, qR, limite, offset}:BusquedaGenericoProp):Promise<RetornoGenericoServiceGet<DtoPropuestaRespuesta>>{
    try{
       const total: GetTotalIdsProp[] = await qR.query(
        `SELECT id, count(*) over() as total 
        from propuesta 
        WHERE nombre ILIKE '%' || $3 || '%'
        order by nombre ASC 
        limit $1 offset $2`,
        [limite, offset, busqueda]
      );

      console.log('total: ', total)
      if (total.length === 0) return { datos: [], total: 0 }
      const ids: string[] = total.map(t => t.id);

      const row: PropuestaVistaProp[] = await qR.query(
        `SELECT * 
        from vw_propuesta
        where id_propuesta = ANY($1::uuid[])`,
        [ids]
      )

      return {
        datos: toRespuestaPropuesta(row),
        total: total[0].total,
      };
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar obtener las propuesta que coinciden con ${busqueda}`)
    }
  }


  async createDato({ dto, qR, entidad }: CreateProp<DtoPropuestaCrear, typeof Entidad.PROPUESTA_PEDIDO>): Promise<Propuesta> {
    try {

      const [propuesta] = await qR.query(
        `INSERT INTO propuesta(nombre)
          VALUES ($1)
          RETURNING id`,
        [dto.nombre]
      );

      const values = dto.libros
        .map((_, i) => `($${i + 1}, $${dto.libros.length + 1})`)
        .join(', ');

      await qR.query(
        `INSERT INTO propuesta_libro_empresa(id_libro, id_propuesta)
          VALUES ${values}`,
        [...dto.libros, propuesta.id]
      );

      const newPropuesta: Propuesta = await this.getDatoByIdOrFail({ id: propuesta.id, qR })

      return newPropuesta;

    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Propuesta, DtoPropuestaEditar, typeof Entidad.PROPUESTA_PEDIDO>): Promise<UpdateRetorno<Propuesta>> {
    try {
      const propuesta: Propuesta = await this.getDatoByIdOrFail({
        id,
        qR,
        relaciones,
        selected,
        entidadError
      });

      const actuales = propuesta.libros?.map(l => l.id_libro);
      const nuevos = dto.libros;

      const setActual = new Set(actuales);
      const setNuevo = new Set(nuevos);

      const sonIguales =
        setActual.size === setNuevo.size &&
        [...setActual].every(id => setNuevo.has(id));

      const libros: Libro[] = sonIguales
        ? propuesta.libros
        : await this.libroService.getLibrosByIds({
          ids: dto.libros,
          qR
        });

      propuesta.nombre = dto.nombre ?? propuesta.nombre;
      propuesta.libros = libros;

      const newPropuesta: Propuesta = qR
        ? await qR.manager.save(Propuesta, propuesta)
        : await this.propuestaRepository.save(propuesta);

      const payload: Mensaje = {
        mensaje: Mens.EDITAR,
        entidad,
        dato: newPropuesta
      }

      this.gatewayGateway.actualizacionDato(payload);

      return { dato: newPropuesta, isQr: true }

    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de propuestas`)
    }
  }

  async quitarLibro({id, id_libros, qR}:QuitarLibrosProp): Promise<boolean>{
    try {
      qR.query(
        `DELETE FROM propuesta_libro_empresa 
        where id_propuesta = $1 AND id_libro = ANY($2::uuid[])`,
        [id, id_libros]
      )

      return true;
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar quitar libros de la propuesta ${id}`)
    }
  }

  remplaceToReturn(entidad: Propuesta): DtoPropuestaRespuesta {
    const base: DtoBaseRetorno = this.remplaceToBase(entidad);

    return {
      ...base,
      nombre: entidad.nombre,

      libros: []
    }
  }
  /* 
    private transformarNombreLibroPropuesta(texto: string): NombreProp {
      const partes = texto
        .split("-")
        .map(p => p.trim())
        .filter(Boolean);
  
      return {
        nombre: partes[0] || "",
        nivel: partes[1] || "",
        componentes: partes.slice(2),
      };
    }
  
    private estanComponentes(componentes: Componente[], nombres: string[]): boolean {
      const setStrings = new Set(nombres);
      const setNombres = new Set(componentes.map(e => e.nombre));
  
      if (setStrings.size !== setNombres.size) {
        return false;
      }
  
      for (const s of setStrings) {
        if (!setNombres.has(s)) {
          return false;
        }
      }
  
      return true;
    }
  
    async createPropuestaDefault({ usuario, qR, libros }: PropuestaDefaultProp): Promise<Propuesta[]> {
      try {
        const propuestas: Propuesta[] = await Promise.all(
          PROPUESTA_DEFAULT.map(async p => {
  
            const nombreLibros: NombreProp[] =
              p.libros.map(pl =>
                this.transformarNombreLibroPropuesta(pl)
              );
  
            const librosAux: Libro[] =
              nombreLibros.flatMap(nm =>
                libros.filter(l =>
                  l.nombre === nm.nombre &&
                  l.nivel === nm.nivel &&
                  this.estanComponentes(
                    l.componentes,
                    nm.componentes
                  )
                )
              );
  
            const dto: DtoPropuestaCrear = {
              nombre: p.nombre,
              libros: librosAux.map(l => l.id)
            };
  
            return await this.createDato({
              usuario,
              qR,
              dto,
              entidad: 'propuesta_pedido'
            });
          })
        );
  
        return propuestas;
      } catch (er) {
        throw this.erroresService.handleExceptions(er, `Error al intentar crear propuestas por defecto`)
      }
    }
   */
  async createElementoDefault({ qR, entidad, defecto, entidadError }: CreateDefaultProp<'propuesta_pedido', DtoPropuestaCrear>): Promise<Propuesta[]> {
    try {

      throw new NotFoundException('Metodo no implementado');

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear ${entidadError} por defecto`)
    }
  }
}
