import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Propuesta } from './entity/propuesta_pedido.entity';
import { DtoPropuestaCrear } from './dto/propuesta_pedidoCrear.dto';
import { DtoPropuestaEditar } from './dto/propuesta_pedidoEditar.dto';
import { Libro } from '../libro/entity/libro.entity';
import { LibroService } from '../libro/libro.service';
import { PROPUESTA_RELATIONS, PROPUESTA_SELECTED } from './default/relacion';
import { PRECIO_SELECTED } from '@src/precio/default/relacion';
import { LIBRO_RELATIONS, SELECTED_LIBROS_TODOS } from '@src/libro/default/relacion.default';


@Injectable()
export class PropuestaService extends BaseService<typeof Entidad.PROPUESTA_PEDIDO, Propuesta, DtoPropuestaCrear, DtoPropuestaEditar> {
  constructor(
    @InjectRepository(Propuesta) private readonly propuestaRepository: Repository<Propuesta>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    private readonly libroService: LibroService
  ) {
    super(propuestaRepository, dataSource, erroresService, gatewayGateway)
  }

  async createDato({ usuario, dto, qR, entidad }: CreateProp<DtoPropuestaCrear, typeof Entidad.PROPUESTA_PEDIDO>): Promise<Propuesta> {
    try {
      const existe: Propuesta | null = await this.getDatoByName({
        dato: dto.nombre,
        usuarioId: usuario.id,
        qR,
        relaciones: [PROPUESTA_RELATIONS],
        selected: PROPUESTA_SELECTED,
        entidadError: 'propuesta de pedido'
      });

      console.log('Existe: ', existe)

      if(existe) throw new NotFoundException(`El nombre ${dto.nombre} de la propuesta del pedido ya existe en la base de datos, elija otro nombre`);

      const libros: Libro[] = await this.libroService.getDatosByIds({
        ids: dto.libros,
        entidadError: 'libro',
        qR,
        usuarioId: usuario.id
      });

      const propuesta: Propuesta = new Propuesta();
      propuesta.nombre = dto.nombre;
      propuesta.libro = libros;
      propuesta.user = usuario;

      const newPropuesta: Propuesta = qR
        ? await qR.manager.save(Propuesta, propuesta)
        : await this.propuestaRepository.save(propuesta);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad,
          dato: newPropuesta
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return newPropuesta;

    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Propuesta, DtoPropuestaEditar, typeof Entidad.PROPUESTA_PEDIDO>): Promise<UpdateRetorno<Propuesta>> {
    try {
      const propuesta: Propuesta = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        relaciones,
        selected,
        entidadError
      });

      const actuales = propuesta.libro?.map(l => l.id);
      const nuevos = dto.libros;

      const setActual = new Set(actuales);
      const setNuevo = new Set(nuevos);

      const sonIguales =
        setActual.size === setNuevo.size &&
        [...setActual].every(id => setNuevo.has(id));

      const libros: Libro[] = sonIguales
        ? propuesta.libro
        : await this.libroService.getDatosByIds({
          ids: dto.libros,
          entidadError: 'libro',
          qR,
          usuarioId,
          relaciones:[LIBRO_RELATIONS],
          selected:SELECTED_LIBROS_TODOS
        });

      propuesta.nombre = dto.nombre ?? propuesta.nombre;
      propuesta.libro = libros;

      const newPropuesta: Propuesta = qR
        ? await qR.manager.save(Propuesta, propuesta)
        : await this.propuestaRepository.save(propuesta);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad,
          dato: newPropuesta
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return { dato: newPropuesta, isQr: true }

    } catch (er) {
      this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de propuestas`)
    }
  }
}
