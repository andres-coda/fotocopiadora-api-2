import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Mensaje } from './dto/gatewayDto.dto';
import { RequestContextService } from '../common/context/request-context.service';
import { Role } from '../auth/rol/rol.enum';

export const EMPRESA_ROOM_PREFIX = 'empresa:';
export const GLOBAL_ROOM = 'global';
export const SUPER_ROOM = 'super';

interface JwtSocketsPayload {
  sub?: string;
  role?: Role;
  idEmpresa?: string | null;
}

/**
 * Gateway de eventos en tiempo real.
 *
 * Cada cliente autenticado entra a la sala de SU empresa
 * (`empresa:<idEmpresa>`, tomado del JWT) y a la sala `global`.
 *
 * `actualizacionDato` emite a la sala de la empresa de QUIEN ejecuta la
 * accion, no a la empresa de la entidad. Los usuarios de otra empresa no
 * reciben el payload. Solo un actor sin empresa (superAdmin) emite a
 * `global`, que es el unico caso de modificacion global.
 *
 * Los super admins tambien entran a la sala `super`: `actualizacionDatoEmpresas`
 * emite a las empresas afectadas y a esa sala en un unico emit.
 */
@WebSocketGateway()
export class GatewayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly requestContext: RequestContextService,
  ) { }

  handleConnection(cliente: Socket) {
    try {
      const token = this.extraerToken(cliente);
      if (!token) throw new Error('Token ausente');

      const payload = this.jwtService.verify<JwtSocketsPayload>(token);

      cliente.data.idEmpresa = payload.idEmpresa ?? null;
      cliente.data.role = payload.role;

      if (payload.idEmpresa) {
        cliente.join(`${EMPRESA_ROOM_PREFIX}${payload.idEmpresa}`);
      }
      cliente.join(GLOBAL_ROOM);

      if (payload.role === Role.SuperAdmin) {
        cliente.join(SUPER_ROOM);
      }

      console.log(`Cliente conectado: ${cliente.id}`);
    } catch {
      console.log(`Cliente rechazado: ${cliente.id}`);
      cliente.disconnect(true);
    }
  }

  handleDisconnect(cliente: Socket) {
    console.log(`Cliente desconectado: ${cliente.id}`);
  }

  actualizacionDato(mensaje: Mensaje) {
    const idEmpresa = this.requestContext.idEmpresa;
    const role = this.requestContext.role;

    if (idEmpresa) {
      this.server
        .to(`${EMPRESA_ROOM_PREFIX}${idEmpresa}`)
        .emit(mensaje.mensaje, mensaje);
      return;
    }

    // Sin empresa en el contexto solo el superAdmin modifica globalmente.
    // Si hay contexto con otro rol, el evento se descarta.
    if (role && role !== Role.SuperAdmin) {
      console.log(`Evento sin empresa descartado para el rol ${role}`);
      return;
    }

    this.server.to(GLOBAL_ROOM).emit(mensaje.mensaje, mensaje);
  }

  /**
   * Emite a las empresas indicadas y a la sala de super admins.
   * Un solo emit por llamada: socket.io une las salas y entrega una copia.
   */
  actualizacionDatoEmpresas(mensaje: Mensaje, idsEmpresa: string[]) {
    const salas = Array.from(new Set(idsEmpresa)).map(
      (id) => `${EMPRESA_ROOM_PREFIX}${id}`,
    );
    salas.push(SUPER_ROOM);

    this.server.to(salas).emit(mensaje.mensaje, mensaje);
  }

  private extraerToken(cliente: Socket): string | undefined {
    const authToken = cliente.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken) return authToken;

    const header = cliente.handshake.headers?.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7);
    }

    return undefined;
  }
}
