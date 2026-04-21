import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { GatewayGateway } from '../gateway.gateway';

describe('GatewayGateway', () => {
  let gateway: GatewayGateway;

  // Mock del server de socket.io
  const mockServer = {
    emit: jest.fn(),
  } as unknown as Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayGateway],
    }).compile();

    gateway = module.get<GatewayGateway>(GatewayGateway);

    // Inyectamos el mock manualmente
    gateway.server = mockServer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('debería loguear cuando un cliente se conecta', () => {
      const cliente = { id: '123' } as Socket;

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      gateway.handleConnection(cliente);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Cliente conectado: 123',
      );
    });
  });

  describe('handleDisconnect', () => {
    it('debería loguear cuando un cliente se desconecta', () => {
      const cliente = { id: '123' } as Socket;

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      gateway.handleDisconnect(cliente);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Cliente desconectado: 123',
      );
    });
  });

  describe('actualizacionDato', () => {
    it('debería emitir un evento con el mensaje correcto', () => {
      const mensaje = {
        mensaje: 'nuevo-evento',
        data: { foo: 'bar' },
      } as any;

      gateway.actualizacionDato(mensaje);

      expect(mockServer.emit).toHaveBeenCalledWith(
        'nuevo-evento',
        mensaje,
      );
    });
  });
});