import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { SolicitudRetorno, PeticionRetorno } from './retorno/solicitud.retorno';
import { DtoSolicitudResolver } from './dto/solicitud.dto';

@Injectable()
export class SolicitudService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly erroresService: ErroresService,
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

  async resolverSolicitud(qR: QueryRunner, id: string, dto: DtoSolicitudResolver): Promise<SolicitudRetorno> {
    try {
      const estado = dto.estado; // 2 = aceptada, 3 = rechazada

      // Si se acepta, aplicar los cambios de las peticiones al libro_completo.
      // Por simplicidad, solo actualizamos el estado de la solicitud y peticiones.
      // La aplicacion real de cambios requiere logica por campo (nivel, nombre, etc.)
      // que depende del back existente. Por ahora marcamos como resuelta.

      await qR.manager.query(
        `update solicitud set estado = $1, fecha_resolucion = now() where id = $2`,
        [estado, id],
      );

      await qR.manager.query(
        `update peticion set estado = $1, observaciones = coalesce($2, observaciones) where id_solicitud = $3`,
        [estado, dto.observaciones ?? null, id],
      );

      return this.getSolicitudById(qR, id);
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar resolver la solicitud ${id}`);
    }
  }
}