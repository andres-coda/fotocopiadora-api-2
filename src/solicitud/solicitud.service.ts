import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { SolicitudRetorno, PeticionRetorno } from './retorno/solicitud.retorno';
import { DtoSolicitudResolver } from './dto/solicitud.dto';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { toRespuestaLibro } from '../libro/utils/toRespuestaLibro';
import { RetornoVistaLibroProp } from '../libro/interface/libro.interface';

@Injectable()
export class SolicitudService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly erroresService: ErroresService,
    private readonly gateway: GatewayGateway,
  ) { }

  async getSolicitudes(qR: QueryRunner, limite = 20, offset = 0): Promise<{ datos: SolicitudRetorno[]; total: number }> {
    try {
      const filas: any[] = await qR.manager.query(
        `select s.id, s.id_libro_completo, s.fecha_creacion as "fechaCreacion",
                s.fecha_resolucion as "fechaResolucion", s.id_usuario as "idUsuario",
                s.estado, s.id_empresa as "idEmpresa",
                u.nombre as "nombreUsuario",
                lb.nombre as "nombreLibro"
         from solicitud s
         left join usuario u on u.id = s.id_usuario
         left join libro_completo lc on lc.id = s.id_libro_completo
         left join libro lb on lb.id = lc.id_libro
         order by s.fecha_creacion desc
         limit $1 offset $2`,
        [limite, offset],
      );

      const totalFilas: { total: number }[] = await qR.manager.query(
        `select count(*)::int as total from solicitud`,
      );

      const datos = filas.map((f) => new SolicitudRetorno({
        id: f.id,
        idLibroCompleto: f.idLibroCompleto,
        nombreLibro: f.nombreLibro ?? 'Libro desconocido',
        fechaCreacion: f.fechaCreacion,
        fechaResolucion: f.fechaResolucion,
        idUsuario: f.idUsuario,
        nombreUsuario: f.nombreUsuario ?? 'Usuario desconocido',
        estado: f.estado,
        idEmpresa: f.idEmpresa,
        peticiones: [],
      }));

      return { datos, total: totalFilas[0]?.total ?? 0 };
    } catch (error) {
      throw this.erroresService.handleExceptions(error, 'Error al intentar leer las solicitudes');
    }
  }

  async getSolicitudById(qR: QueryRunner, id: string): Promise<SolicitudRetorno> {
    try {
      const filas: any[] = await qR.manager.query(
        `select s.id, s.id_libro_completo, s.fecha_creacion as "fechaCreacion",
                s.fecha_resolucion as "fechaResolucion", s.id_usuario as "idUsuario",
                s.estado, s.id_empresa as "idEmpresa",
                u.nombre as "nombreUsuario",
                lb.nombre as "nombreLibro"
         from solicitud s
         left join usuario u on u.id = s.id_usuario
         left join libro_completo lc on lc.id = s.id_libro_completo
         left join libro lb on lb.id = lc.id_libro
         where s.id = $1`,
        [id],
      );

      if (!filas[0]) throw new NotFoundException('No se encontro la solicitud');

      const f = filas[0];

      // Obtener peticiones
      const petFilas: any[] = await qR.manager.query(
        `select id, campo, valor_anterior as "valorAnterior", valor_nuevo as "valorNuevo",
                observaciones, estado
         from peticion where id_solicitud = $1`,
        [id],
      );

      const peticiones = petFilas.map((p) => new PeticionRetorno({
        id: p.id,
        campo: p.campo,
        valorAnterior: p.valorAnterior,
        valorNuevo: p.valorNuevo,
        observaciones: p.observaciones,
        estado: p.estado,
      }));

      return new SolicitudRetorno({
        id: f.id,
        idLibroCompleto: f.idLibroCompleto,
        nombreLibro: f.nombreLibro ?? 'Libro desconocido',
        fechaCreacion: f.fechaCreacion,
        fechaResolucion: f.fechaResolucion,
        idUsuario: f.idUsuario,
        nombreUsuario: f.nombreUsuario ?? 'Usuario desconocido',
        estado: f.estado,
        idEmpresa: f.idEmpresa,
        peticiones,
      });
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer la solicitud ${id}`);
    }
  }

  async resolverPeticion(
    qR: QueryRunner,
    idPeticion: string,
    dto: DtoSolicitudResolver,
  ): Promise<SolicitudRetorno> {
    try {
      const [fila]: { id_solicitud: string }[] = await qR.manager.query(
        `select id_solicitud from peticion where id = $1`,
        [idPeticion],
      );

      if (!fila) throw new NotFoundException('No se encontro la peticion');

      // Acepta (2) o rechaza (3) una peticion. La funcion aplica el campo en el
      // libro correcto y cierra la solicitud cuando no quedan pendientes.
      const afectados: { id_afectado: string }[] = await qR.manager.query(
        `select id_afectado from fc_aplicar_peticion($1, $2, $3)`,
        [idPeticion, dto.estado, dto.observaciones ?? null],
      );

      if (afectados.length > 0) {
        await this.emitirLibros(qR, afectados.map((a) => a.id_afectado));
      }

      return this.getSolicitudById(qR, fila.id_solicitud);
    } catch (error) {
      throw this.erroresService.handleExceptions(
        error,
        `Error al intentar resolver la peticion ${idPeticion}`,
      );
    }
  }

  /**
   * Una fila de `vw_libro_busqueda` por empresa que usa el libro. Cada empresa
   * recibe solo la suya; la sala de super admins recibe todas.
   */
  private async emitirLibros(qR: QueryRunner, ids: string[]): Promise<void> {
    const filas: RetornoVistaLibroProp[] = await qR.manager.query(
      `select * from vw_libro_busqueda where id = any($1::uuid[])`,
      [ids],
    );

    for (const fila of filas) {
      const libro = toRespuestaLibro(fila);
      if (!libro || !fila.id_empresa) continue;

      const payload: Mensaje = {
        mensaje: Mens.EDITAR,
        entidad: Entidad.LIBRO,
        dato: libro,
      };

      this.gateway.actualizacionDatoEmpresas(payload, [fila.id_empresa]);
    }
  }
}