import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { GatewayGateway, EMPRESA_ROOM_PREFIX, GLOBAL_ROOM } from '../gateway.gateway';
import { RequestContextService } from '@src/common/context/request-context.service';
import { Role } from '@src/auth/rol/rol.enum';
import { Mens } from '../enum/Mens.enum';
import { Entidad } from '../dto/gatewayDto.dto';

/**
 * Server de socket.io falso.
 * `to(sala).emit(evento, payload)` queda registrado en `serverTo` y `emitSpy`.
 */
const crearServer = () => {
  const emitSpy = jest.fn();
  const serverTo = jest.fn(() => ({ emit: emitSpy }));
  return { server: { to: serverTo } as any, serverTo, emitSpy };
};

/** Cliente socket falso. */
const crearCliente = (auth: any = {}, headers: any = {}) =>
  ({
    id: 'socket-1',
    data: {},
    handshake: { auth, headers },
    join: jest.fn(),
    disconnect: jest.fn(),
  }) as any;

describe('GatewayGateway', () => {
  let requestContext: RequestContextService;
  let jwtService: { verify: jest.Mock<(token: string) => any> };
  let gateway: GatewayGateway;
  let serverTo: jest.Mock;
  let emitSpy: jest.Mock;

  beforeEach(() => {
    requestContext = new RequestContextService();
    jwtService = { verify: jest.fn<(token: string) => any>() };

    gateway = new GatewayGateway(jwtService as any, requestContext);

    const servidor = crearServer();
    serverTo = servidor.serverTo;
    emitSpy = servidor.emitSpy;
    gateway.server = servidor.server;

    jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('con token valido y empresa: entra a la sala de la empresa y a global', () => {
      const cliente = crearCliente({ token: 'token-valido' });
      jwtService.verify.mockReturnValue({ idEmpresa: 'emp-a', role: Role.Admin });

      gateway.handleConnection(cliente);

      expect(jwtService.verify).toHaveBeenCalledWith('token-valido');
      expect(cliente.join).toHaveBeenCalledWith(`${EMPRESA_ROOM_PREFIX}emp-a`);
      expect(cliente.join).toHaveBeenCalledWith(GLOBAL_ROOM);
      expect(cliente.join).toHaveBeenCalledTimes(2);
      expect(cliente.disconnect).not.toHaveBeenCalled();
    });

    it('con token valido sin empresa: entra solo a global', () => {
      const cliente = crearCliente({ token: 'token-super' });
      jwtService.verify.mockReturnValue({ role: Role.SuperAdmin, idEmpresa: null });

      gateway.handleConnection(cliente);

      expect(cliente.join).toHaveBeenCalledWith(GLOBAL_ROOM);
      expect(cliente.join).toHaveBeenCalledTimes(1);
      expect(cliente.join).not.toHaveBeenCalledWith(`${EMPRESA_ROOM_PREFIX}null`);
      expect(cliente.disconnect).not.toHaveBeenCalled();
    });

    it('con token invalido: desconecta y no se une a ninguna sala', () => {
      const cliente = crearCliente({ token: 'token-invalido' });
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt invalido');
      });

      gateway.handleConnection(cliente);

      expect(cliente.disconnect).toHaveBeenCalledWith(true);
      expect(cliente.join).not.toHaveBeenCalled();
    });

    it('sin token: desconecta sin llamar a verify', () => {
      const cliente = crearCliente({}, {});

      gateway.handleConnection(cliente);

      expect(cliente.disconnect).toHaveBeenCalledWith(true);
      expect(jwtService.verify).not.toHaveBeenCalled();
      expect(cliente.join).not.toHaveBeenCalled();
    });

    it('toma el token del header Authorization como Bearer', () => {
      const cliente = crearCliente({}, { authorization: 'Bearer token-header' });
      jwtService.verify.mockReturnValue({ idEmpresa: 'emp-a', role: Role.Admin });

      gateway.handleConnection(cliente);

      expect(jwtService.verify).toHaveBeenCalledWith('token-header');
    });

    it('puebla data.idEmpresa y data.role desde el payload', () => {
      const cliente = crearCliente({ token: 'token-valido' });
      jwtService.verify.mockReturnValue({ idEmpresa: 'emp-a', role: Role.Operador });

      gateway.handleConnection(cliente);

      expect(cliente.data.idEmpresa).toBe('emp-a');
      expect(cliente.data.role).toBe(Role.Operador);
    });
  });

  describe('actualizacionDato', () => {
    const crearMensaje = (): any => ({
      mensaje: Mens.CREAR,
      entidad: Entidad.PRECIO,
      dato: { id: 'precio-1' },
    });

    it('con empresa en el contexto: emite a la sala de esa empresa', () => {
      const mensaje = crearMensaje();

      requestContext.run({ idEmpresa: 'emp-a', role: Role.Admin }, () => {
        gateway.actualizacionDato(mensaje);
      });

      expect(serverTo).toHaveBeenCalledWith(`${EMPRESA_ROOM_PREFIX}emp-a`);
      expect(emitSpy).toHaveBeenCalledWith(mensaje.mensaje, mensaje);
    });

    it('sin empresa y rol superAdmin: emite a global', () => {
      const mensaje = crearMensaje();

      requestContext.run({ idEmpresa: null, role: Role.SuperAdmin }, () => {
        gateway.actualizacionDato(mensaje);
      });

      expect(serverTo).toHaveBeenCalledWith(GLOBAL_ROOM);
      expect(emitSpy).toHaveBeenCalledWith(mensaje.mensaje, mensaje);
    });

    it('sin empresa y rol admin: descarta el evento', () => {
      const mensaje = crearMensaje();

      requestContext.run({ idEmpresa: null, role: Role.Admin }, () => {
        gateway.actualizacionDato(mensaje);
      });

      expect(serverTo).not.toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('sin contexto (proceso del sistema): cae en global', () => {
      const mensaje = crearMensaje();

      gateway.actualizacionDato(mensaje);

      expect(serverTo).toHaveBeenCalledWith(GLOBAL_ROOM);
      expect(emitSpy).toHaveBeenCalledWith(mensaje.mensaje, mensaje);
    });
  });
});
