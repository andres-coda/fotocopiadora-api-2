import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateDefaultProp, CreateProp, EditarProp, GenericoProp, GetProp, RetornoGet, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, EntidadDatoMapType, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Propuesta } from './entity/propuesta_pedido.entity';
import { DtoPropuestaCrear } from './dto/propuesta_pedidoCrear.dto';
import { DtoPropuestaEditar } from './dto/propuesta_pedidoEditar.dto';
import { Libro } from '../libro/entity/libro.entity';
import { LibroService } from '../libro/libro.service';
import { PROPUESTA_RELATIONS, PROPUESTA_SELECTED } from './default/relacion';
import { DtoPropuestaRespuesta } from './dto/propuestaRetorno.dto';
import { DtoBaseRetorno } from '../base/dto/baseRetorno.dto';
import { DtoLibroRespuesta } from '../libro/dto/libroRetorno.dto';
import { User } from '@src/user/entity/user.entity';
import { PROPUESTA_DEFAULT } from './default/propuesta.default';
import { Componente } from '@src/componente/entity/componente.entity';
import { toRespuestaPropuesta } from './utils/toRespuestaPropuesta';
import { toRespuestaLibro, toRespuestaLibroEmpresa, toRespuestaLibroEmptresXlibro } from '@src/libro/utils/toRespuestaLibro';
import { GetGenericoByIdProp, GetGenericoProp } from '@src/interface/general.interface';



interface NombreProp {
  nombre: string,
  nivel: string,
  componentes: string[]
}

interface PropuestaDefaultProp extends Pick<GenericoProp, 'qR'> {
  libros: Libro[],
  usuario: User,
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
      const [row] = await qR.query(
        'SELECT fc_obtener_propuestas($1, $2, $3) as resultado',
        [limite, offset, orden]
      );

      return { datos: toRespuestaPropuesta(row.resultado), total:row.total };
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer las propusetas`)
    }
  }

  async getDatoCx({ qR, entidadError = 'Propuesta', limite = 50, offset = 0 }: GetProp<Propuesta>): Promise<RetornoGet<'propuesta_pedido'>> {
    try {
      const find: { datos: DtoPropuestaRespuesta[], total: number } = await this.getPropuesta({ qR, limite, offset });

      return {
        datos: find.datos,
        total: find.total,
        limite: limite,
        pagina: offset + 1
      };
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer todos los  ${entidadError} de la base de datos`)
    }
  }

  async getPropuestaById({ qR, id }: GetGenericoByIdProp): Promise<DtoPropuestaRespuesta> {
    try {
      const rows = await qR.query(
        'SELECT * FROM vw_propuesta WHERE id = $1 ORDER BY nombre',
        [id]
      );

      const propuesta = toRespuestaPropuesta(rows);
      if (propuesta.length != 1) throw new NotFoundException('Hay propuesta con id duplicadas');
      return propuesta[0];
    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar leer las propusetas`)
    }
  }


  async createDato({ dto, qR, entidad }: CreateProp<DtoPropuestaCrear, typeof Entidad.PROPUESTA_PEDIDO>): Promise<Propuesta> {
    try {

      const libros: Libro[] = await this.libroService.getLibrosByIds({
        ids: dto.libros,
        qR,
      });

      const propuesta: Propuesta = new Propuesta();
      propuesta.nombre = dto.nombre;
      propuesta.libros = libros;

      const newPropuesta: Propuesta = qR
        ? await qR.manager.save(Propuesta, propuesta)
        : await this.propuestaRepository.save(propuesta);

      const payload: Mensaje = {
        mensaje: Mens.CREAR,
        entidad,
        dato: newPropuesta
      }

      this.gatewayGateway.actualizacionDato(payload);


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
