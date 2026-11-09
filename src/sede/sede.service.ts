import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, DeletProp, EditarProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Sede } from './entity/sede.entity';
import { DtoSedeCrear } from './dto/sedeCrear.dto';
import { DtoSedeEditar } from './dto/sedeEditar.dto';
import { SEDE_RELATIONS, SEDE_SELECTED } from './default/relacion';
import { DtoBaseRetorno } from '../base/dto/baseRetorno.dto';
import { GetGenericoProp, RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { SedeRetorno } from './retorno/sede.retorno';

@Injectable()
export class SedeService extends BaseService<typeof Entidad.SEDE, Sede, DtoSedeCrear, DtoSedeEditar> {
  constructor(
    @InjectRepository(Sede) private readonly sedeRepository: Repository<Sede>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(sedeRepository, dataSource, erroresService, gatewayGateway)
  }

  async getSedesTodas({ qR, limite, offset }: GetGenericoProp): Promise<RetornoGenericoServiceGet<SedeRetorno>> {
    try {
      const newOffset: number = Number(offset) > 0 ? Number(offset) : 0;
      const criterio: FindManyOptions = {
        take: limite ?? 20,
        skip: newOffset        
      }
      const [datos, total] = await qR.manager.findAndCount(Sede, criterio);

      const retorno: SedeRetorno[] = (datos ?? []).flatMap(e => {
        const sede = this.remplaceToReturn(e);
        return sede ? [sede] : [];
      });

      return {
        total,
        datos: retorno,
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar leer los datos eliminados y no eliminados de sede`)
    }
  }

  async createDato({ dto, qR, entidad }: CreateProp<DtoSedeCrear, typeof Entidad.SEDE>): Promise<Sede> {
    try {
      const sedeExistente: Sede | null = await this.getDatoByName({
        dato: dto.nombre,
        qR,
        relaciones: [SEDE_RELATIONS],
        selected: SEDE_SELECTED,
        entidadError: 'sede'
      });

      // El índice único por nombre (uq_sede_nombre) incluye las borradas, así
      // que re-crear una sede con el nombre de una eliminada es el único camino
      // para reutilizarlo. Si la existente está borrada, la revivimos en vez de
      // devolverla con deleted = true (lo que hacía que reapareciera en el
      // selector de nuevo pedido).
      if (sedeExistente) {
        if (sedeExistente.deleted) {
          sedeExistente.deleted = false;
          return qR
            ? await qR.manager.save(Sede, sedeExistente)
            : await this.sedeRepository.save(sedeExistente);
        }
        return sedeExistente;
      }

      const sede: Sede = new Sede();
      sede.nombre = dto.nombre;

      const newSede: Sede = qR
        ? await qR.manager.save(Sede, sede)
        : await this.sedeRepository.save(sede);

      return newSede;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.nombre} en el registro de ${entidad}`)
    }
  }

  async updateDato({ dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Sede, DtoSedeEditar, typeof Entidad.SEDE>): Promise<UpdateRetorno<Sede>> {
    try {
      const sede: Sede = await this.getDatoByIdOrFail({
        id,
        qR,
        relaciones,
        selected,
        entidadError
      });
      if (sede.nombre === dto.nombre) return { dato: sede, isQr: false };

      sede.nombre = dto.nombre;

      const newSede: Sede = qR
        ? await qR.manager.save(Sede, sede)
        : await this.sedeRepository.save(sede);

      return { dato: newSede, isQr: true };

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.nombre || id} en el registro de sedes`)
    }
  }

  // Borrado lógico de sede: además de marcar deleted = true, se limpia la
  // configuración de empresa que apuntaba a esta sede. El modal del front
  // promete que "también se borrará de la configuración de por defecto" y,
  // si no se limpia, el front toma sedes[0] en silencio y el pedido se crea
  // en la sede equivocada. La columna configuraciones.id_sede es nullable.
  async softDelete({ id, qR, entidadError, entidad }: DeletProp<Sede, typeof Entidad.SEDE>): Promise<boolean> {
    const borrada: boolean = await super.softDelete({ id, qR, entidadError, entidad });
    if (!borrada) return borrada;
    const manager = qR ? qR.manager : this.dataSource.manager;
    await manager.query('update configuraciones set id_sede = null where id_sede = $1', [id]);
    return borrada;
  }

  remplaceToReturn(entidad: Sede): SedeRetorno {
    const sede = new SedeRetorno({...entidad});
    return sede;
  }
}
