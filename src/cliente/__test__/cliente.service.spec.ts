import { Test, TestingModule } from '@nestjs/testing';
import { ClienteService } from '../cliente.service';
import { DataSource, Repository } from 'typeorm';
import { Cliente } from '../entity/cliente.entity';
import { ErroresService } from '@src/error/error.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { mockGateway } from 'test/mock/gateway.mocks';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mockCliente, mockClienteService } from 'test/mock/cliente.mock';
import { mockResumen, mockResumenService } from 'test/mock/resumen.mock';
import { mockUser } from 'test/mock/user.mock';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockQueryRunner, createMockDataSource } from 'test/mock/qR.mock';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { ClienteResumenService } from '@src/cliente_resumen/cliente_resumen.service';
import { NotFoundException } from '@nestjs/common';

/* =========================
   🔧 MOCKS DE MÓDULOS
========================= */

jest.mock('@src/cliente/entity/cliente.entity', () => ({
  Cliente: class {
    constructor() { }
  },
}));

jest.mock('@src/cliente_resumen/entity/clienteResumen.entity', () => ({
  ClienteResumen: class {
    constructor() { }
  },
}));

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

/* =========================
   🧪 TEST SUITE
========================= */

describe('ClienteService', () => {
  let service: ClienteService;
  let repo: jest.Mocked<Repository<Cliente>>;

  const { qr, manager } = createMockQueryRunner<Cliente>();
  const dataSource = createMockDataSource(qr);

  // El mockResumenService del archivo mock no tiene createDatoXEntidad ni remplaceToReturn,
  // los extendemos aquí para no modificar el archivo de mock.
  const resumenServiceMock = {
    ...mockResumenService,
    createDatoXEntidad: jest.fn() as jest.MockedFunction<any>,
    updateDato: jest.fn() as jest.MockedFunction<any>,
    remplaceToReturn: (jest.fn() as jest.MockedFunction<any>).mockReturnValue({
      id: mockResumen.id,
      pendiente: mockResumen.pendiente,
      listo: mockResumen.listo,
      retirado: mockResumen.retirado,
      deleted: mockResumen.deleted,
    }),
  };

  beforeEach(async () => {
    repo = createMockRepository<Cliente>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteService,
        {
          provide: getRepositoryToken(Cliente),
          useValue: repo,
        },
        {
          provide: ErroresService,
          useValue: mockErrores,
        },
        {
          provide: GatewayGateway,
          useValue: mockGateway,
        },
        // ✅ Fix principal: usar el token de clase, no el string 'ClienteResumenService'
        {
          provide: ClienteResumenService,
          useValue: resumenServiceMock,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<ClienteService>(ClienteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =========================
     🔹 getDatoByTelefono
  ========================= */

  describe('getDatoByTelefono', () => {
    it('[camino feliz] debería devolver el cliente cuando existe', async () => {
      repo.findOne.mockResolvedValue(mockCliente);

      const result = await service.getDatoByTelefono({
        dato: mockCliente.telefono!,
        usuarioId: mockUser.id,
      });

      expect(result).toEqual(mockCliente);
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ telefono: mockCliente.telefono }),
        }),
      );
    });

    it('[camino feliz] debería devolver null cuando no encuentra el cliente', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.getDatoByTelefono({
        dato: '0000000000',
        usuarioId: mockUser.id,
      });

      expect(result).toBeNull();
      expect(repo.findOne).toHaveBeenCalled();
    });

    it('[transacción] debería usar qR.manager.findOne si se provee QueryRunner', async () => {
      manager.findOne.mockResolvedValue(mockCliente);

      const result = await service.getDatoByTelefono({
        dato: mockCliente.telefono!,
        usuarioId: mockUser.id,
        qR: qr,
      });

      expect(result).toEqual(mockCliente);
      expect(manager.findOne).toHaveBeenCalledWith(
        Cliente,
        expect.objectContaining({
          where: expect.objectContaining({ telefono: mockCliente.telefono }),
        }),
      );
      expect(repo.findOne).not.toHaveBeenCalled();
    });

    it('[error] debería llamar handleExceptions si el repositorio falla', async () => {
      const dbError = new Error('DB error');
      repo.findOne.mockRejectedValue(dbError);

      await expect(
        service.getDatoByTelefono({ dato: mockCliente.telefono!, usuarioId: mockUser.id }),
      ).rejects.toThrow();

      expect(mockErrores.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.stringContaining('Error al intentar leer el cliente'),
      );
    });
  });

  /* =========================
     🔹 getDatoByEmail
  ========================= */

  describe('getDatoByEmail', () => {
    it('[camino feliz] debería devolver el cliente cuando existe', async () => {
      repo.findOne.mockResolvedValue(mockCliente);

      const result = await service.getDatoByEmail({
        dato: mockCliente.email!,
        usuarioId: mockUser.id,
      });

      expect(result).toEqual(mockCliente);
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ email: mockCliente.email }),
        }),
      );
    });

    it('[camino feliz] debería devolver null cuando no encuentra el cliente', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.getDatoByEmail({
        dato: 'noexiste@email.com',
        usuarioId: mockUser.id,
      });

      expect(result).toBeNull();
      expect(repo.findOne).toHaveBeenCalled();
    });

    it('[transacción] debería usar qR.manager.findOne si se provee QueryRunner', async () => {
      manager.findOne.mockResolvedValue(mockCliente);

      const result = await service.getDatoByEmail({
        dato: mockCliente.email!,
        usuarioId: mockUser.id,
        qR: qr,
      });

      expect(result).toEqual(mockCliente);
      expect(manager.findOne).toHaveBeenCalledWith(
        Cliente,
        expect.objectContaining({
          where: expect.objectContaining({ email: mockCliente.email }),
        }),
      );
      expect(repo.findOne).not.toHaveBeenCalled();
    });

    it('[error] debería llamar handleExceptions si el repositorio falla', async () => {
      const dbError = new Error('DB error');
      repo.findOne.mockRejectedValue(dbError);

      await expect(
        service.getDatoByEmail({ dato: mockCliente.email!, usuarioId: mockUser.id }),
      ).rejects.toThrow();

      expect(mockErrores.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.stringContaining('Error al intentar leer el cliente'),
      );
    });
  });

  /* =========================
     🔹 clienteExistente
  ========================= */

  describe('clienteExistente', () => {
    it('[camino feliz] debería devolver cliente si lo encuentra por teléfono', async () => {
      jest.spyOn(service, 'getDatoByTelefono').mockResolvedValue(mockCliente);
      jest.spyOn(service, 'getDatoByEmail').mockResolvedValue(null);

      const result = await service.clienteExistente({
        dato: mockCliente.telefono!,
        usuarioId: mockUser.id,
      });

      expect(result).toEqual(mockCliente);
      expect(service.getDatoByTelefono).toHaveBeenCalled();
      // Si encuentra por teléfono no debe buscar por email
      expect(service.getDatoByEmail).not.toHaveBeenCalled();
    });

    it('[camino feliz] debería buscar por email si no encuentra por teléfono', async () => {
      jest.spyOn(service, 'getDatoByTelefono').mockResolvedValue(null);
      jest.spyOn(service, 'getDatoByEmail').mockResolvedValue(mockCliente);

      const result = await service.clienteExistente({
        dato: mockCliente.email!,
        usuarioId: mockUser.id,
      });

      expect(result).toEqual(mockCliente);
      expect(service.getDatoByTelefono).toHaveBeenCalled();
      expect(service.getDatoByEmail).toHaveBeenCalled();
    });

    it('[camino feliz] debería devolver null si no encuentra ni por teléfono ni por email', async () => {
      jest.spyOn(service, 'getDatoByTelefono').mockResolvedValue(null);
      jest.spyOn(service, 'getDatoByEmail').mockResolvedValue(null);

      const result = await service.clienteExistente({
        dato: 'noexiste',
        usuarioId: mockUser.id,
      });

      expect(result).toBeNull();
    });

    it('[transacción] debería propagar el QueryRunner a getDatoByTelefono y getDatoByEmail', async () => {
      jest.spyOn(service, 'getDatoByTelefono').mockResolvedValue(null);
      jest.spyOn(service, 'getDatoByEmail').mockResolvedValue(mockCliente);

      await service.clienteExistente({
        dato: mockCliente.email!,
        usuarioId: mockUser.id,
        qR: qr,
      });

      expect(service.getDatoByTelefono).toHaveBeenCalledWith(
        expect.objectContaining({ qR: qr }),
      );
      expect(service.getDatoByEmail).toHaveBeenCalledWith(
        expect.objectContaining({ qR: qr }),
      );
    });

    it('[error] debería llamar handleExceptions si getDatoByTelefono falla', async () => {
      const error = new Error('fail telefono');
      jest.spyOn(service, 'getDatoByTelefono').mockRejectedValue(error);

      await expect(
        service.clienteExistente({ dato: '123', usuarioId: mockUser.id }),
      ).rejects.toThrow();

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });

    it('[error] debería llamar handleExceptions si getDatoByEmail falla', async () => {
      const error = new Error('fail email');
      jest.spyOn(service, 'getDatoByTelefono').mockResolvedValue(null);
      jest.spyOn(service, 'getDatoByEmail').mockRejectedValue(error);

      await expect(
        service.clienteExistente({ dato: 'mail@test.com', usuarioId: mockUser.id }),
      ).rejects.toThrow();

      expect(service.getDatoByEmail).toHaveBeenCalled();
      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 createDato
  ========================= */

  describe('createDato', () => {
    it('[camino feliz] debería crear cliente nuevo con teléfono', async () => {
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(null);
      (resumenServiceMock.createDatoXEntidad as jest.MockedFunction<any>).mockResolvedValue(mockResumen);
      repo.save.mockResolvedValue(mockCliente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: { nombre: 'Test', telefono: '1134567890' },
        entidad: Entidad.CLIENTE,
      });

      expect(result).toEqual(expect.objectContaining({ id: mockCliente.id }));
      expect(service.clienteExistente).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(resumenServiceMock.createDatoXEntidad).toHaveBeenCalled();
    });

    it('[camino feliz] debería crear cliente nuevo con email si no hay teléfono', async () => {
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(null);
      (resumenServiceMock.createDatoXEntidad as jest.MockedFunction<any>).mockResolvedValue(mockResumen);
      repo.save.mockResolvedValue(mockCliente);

      await service.createDato({
        usuario: mockUser,
        dto: { nombre: 'Test', email: 'test@mail.com' },
        entidad: Entidad.CLIENTE,
      });

      expect(service.clienteExistente).toHaveBeenCalledWith(
        expect.objectContaining({ dato: 'test@mail.com' }),
      );
    });

    it('[camino feliz] debería emitir evento gateway al crear sin QueryRunner', async () => {
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(null);
      (resumenServiceMock.createDatoXEntidad as jest.MockedFunction<any>).mockResolvedValue(mockResumen);
      repo.save.mockResolvedValue(mockCliente);

      await service.createDato({
        usuario: mockUser,
        dto: { nombre: 'Test', telefono: '1134567890' },
        entidad: Entidad.CLIENTE,
      });

      expect(mockGateway.actualizacionDato).toHaveBeenCalledWith(
        expect.objectContaining({ entidad: Entidad.CLIENTE }),
      );
    });

    it('[camino feliz] debería retornar cliente existente sin crear uno nuevo si ya existe y no viene de pedido', async () => {
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(mockCliente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: { nombre: 'Test', telefono: mockCliente.telefono },
        entidad: Entidad.CLIENTE,
      });

      expect(result).toEqual(mockCliente);
      expect(repo.save).not.toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('[camino feliz] debería actualizar resumen si el cliente ya existe y vienePedido=true', async () => {
      const clienteConResumen = { ...mockCliente, resumen: mockResumen };
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(clienteConResumen);
      (resumenServiceMock.updateDato as jest.MockedFunction<any>).mockResolvedValue({ dato: mockResumen, isQr: true });

      const result = await service.createDato({
        usuario: mockUser,
        dto: { nombre: 'Test', telefono: mockCliente.telefono, vienePedido: true },
        entidad: Entidad.CLIENTE,
      });

      expect(resumenServiceMock.updateDato).toHaveBeenCalled();
      expect(result.resumen).toEqual(mockResumen);
    });

    it('[transacción] debería usar qR.manager.save y no emitir gateway', async () => {
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(null);
      (resumenServiceMock.createDatoXEntidad as jest.MockedFunction<any>).mockResolvedValue(mockResumen);
      manager.save.mockResolvedValue(mockCliente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: { nombre: 'Test', telefono: '1134567890' },
        entidad: Entidad.CLIENTE,
        qR: qr,
      });

      expect(manager.save).toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ id: mockCliente.id }));
    });

    it('[error] debería lanzar error si no se proporciona teléfono ni email', async () => {
      await expect(
        service.createDato({
          usuario: mockUser,
          dto: { nombre: 'Test' },
          entidad: Entidad.CLIENTE,
        }),
      ).rejects.toThrow();

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });

    it('[error] debería llamar handleExceptions si el repositorio save falla', async () => {
      const dbError = new Error('DB error');
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(null);
      repo.save.mockRejectedValue(dbError);

      await expect(
        service.createDato({
          usuario: mockUser,
          dto: { nombre: 'Test', telefono: '1134567890' },
          entidad: Entidad.CLIENTE,
        }),
      ).rejects.toThrow();

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });

    it('[error] debería llamar handleExceptions si createDatoXEntidad falla', async () => {
      const dbError = new Error('Error en resumen');
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(null);
      repo.save.mockResolvedValue(mockCliente);
      (resumenServiceMock.createDatoXEntidad as jest.MockedFunction<any>).mockRejectedValue(dbError);

      await expect(
        service.createDato({
          usuario: mockUser,
          dto: { nombre: 'Test', telefono: '1134567890' },
          entidad: Entidad.CLIENTE,
        }),
      ).rejects.toThrow();

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 updateDato
  ========================= */

  describe('updateDato', () => {
    it('[camino feliz] debería actualizar el cliente y retornar { dato, isQr: true }', async () => {
      const clienteBase = { ...mockCliente };
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(clienteBase);
      repo.save.mockResolvedValue({ ...clienteBase, nombre: 'Nuevo Nombre' });

      const result = await service.updateDato({
        id: mockCliente.id,
        usuarioId: mockUser.id,
        dto: { nombre: 'Nuevo Nombre' },
        entidad: Entidad.CLIENTE,
      });

      expect(result.isQr).toBe(true);
      expect(result.dato).toBeDefined();
      expect(repo.save).toHaveBeenCalled();
    });

    it('[camino feliz] debería actualizar solo los campos enviados (update parcial)', async () => {
      const clienteBase = { ...mockCliente };
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(clienteBase);
      repo.save.mockResolvedValue(clienteBase);

      await service.updateDato({
        id: mockCliente.id,
        usuarioId: mockUser.id,
        dto: { nombre: 'Nuevo Nombre' },
        entidad: Entidad.CLIENTE,
      });

      expect(clienteBase.nombre).toBe('Nuevo Nombre');
      // Los campos no enviados no deben cambiar
      expect(clienteBase.telefono).toBe(mockCliente.telefono);
      expect(clienteBase.email).toBe(mockCliente.email);
    });

    it('[camino feliz] debería emitir evento gateway si no hay QueryRunner', async () => {
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue({ ...mockCliente });
      repo.save.mockResolvedValue(mockCliente);

      await service.updateDato({
        id: mockCliente.id,
        usuarioId: mockUser.id,
        dto: { nombre: 'Nuevo Nombre' },
        entidad: Entidad.CLIENTE,
      });

      expect(mockGateway.actualizacionDato).toHaveBeenCalledWith(
        expect.objectContaining({ entidad: Entidad.CLIENTE }),
      );
    });

    it('[transacción] debería usar qR.manager.save y no emitir gateway', async () => {
      const clienteBase = { ...mockCliente };
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(clienteBase);
      manager.save.mockResolvedValue(clienteBase);

      const result = await service.updateDato({
        id: mockCliente.id,
        usuarioId: mockUser.id,
        dto: { nombre: 'Nuevo Nombre' },
        entidad: Entidad.CLIENTE,
        qR: qr,
      });

      expect(result).toEqual({ dato: clienteBase, isQr: true });
      expect(manager.save).toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('[error] debería llamar handleExceptions si getDatoByIdOrFail falla', async () => {
      const error = new NotFoundException('not found');
      jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(error);

      await expect(
        service.updateDato({
          id: 'id-inexistente',
          usuarioId: mockUser.id,
          dto: {},
          entidad: Entidad.CLIENTE,
        }),
      ).rejects.toThrow();

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });

    it('[error] debería llamar handleExceptions si el save falla', async () => {
      const dbError = new Error('DB error');
      jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue({ ...mockCliente });
      repo.save.mockRejectedValue(dbError);

      await expect(
        service.updateDato({
          id: mockCliente.id,
          usuarioId: mockUser.id,
          dto: { nombre: 'Nuevo Nombre' },
          entidad: Entidad.CLIENTE,
        }),
      ).rejects.toThrow();

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 getDatoCx
  ========================= */

  describe('getDatoCx', () => {
    it('[camino feliz] debería retornar clientes con contadores de pedidos calculados', async () => {
      const clienteConPedidos = {
        ...mockCliente,
        pedidos: [
          {
            libroPedidos: [
              { estado: 'p', cantidad: 1 },   // PENDIENTE
              { estado: 'l', cantidad: 1 },   // LISTO
            ],
          },
          {
            libroPedidos: [
              { estado: 'r', cantidad: 1 },   // RETIRADO
            ],
          },
        ],
      };
      repo.find.mockResolvedValue([clienteConPedidos] as any);

      const result = await service.getDatoCx({ usuarioId: mockUser.id });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockCliente.id,
        nombre: mockCliente.nombre,
        telefono: mockCliente.telefono,
        email: mockCliente.email,
      });
      expect(typeof result[0].pendiente).toBe('number');
      expect(typeof result[0].listo).toBe('number');
      expect(typeof result[0].retirado).toBe('number');
    });

    it('[camino feliz] debería retornar array vacío si no hay clientes', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.getDatoCx({ usuarioId: mockUser.id });

      expect(result).toEqual([]);
    });

    it('[camino feliz] debería contar correctamente pedidos pendientes', async () => {
      const clienteConPedido = {
        ...mockCliente,
        pedidos: [
          { libroPedidos: [{ estado: 'p' }] },  // pendiente
        ],
      };
      repo.find.mockResolvedValue([clienteConPedido] as any);

      const result = await service.getDatoCx({ usuarioId: mockUser.id });

      expect(result[0].pendiente).toBe(1);
      expect(result[0].listo).toBe(0);
      expect(result[0].retirado).toBe(0);
    });

    it('[camino feliz] debería contar correctamente pedidos listos', async () => {
      const clienteConPedido = {
        ...mockCliente,
        pedidos: [
          { libroPedidos: [{ estado: 'l' }] }, // listo
        ],
      };
      repo.find.mockResolvedValue([clienteConPedido] as any);

      const result = await service.getDatoCx({ usuarioId: mockUser.id });

      expect(result[0].listo).toBe(1);
      expect(result[0].pendiente).toBe(0);
      expect(result[0].retirado).toBe(0);
    });

    it('[error] debería llamar handleExceptions si el repositorio falla', async () => {
      repo.find.mockRejectedValue(new Error('DB error'));

      await expect(service.getDatoCx({ usuarioId: mockUser.id })).rejects.toThrow();

      expect(mockErrores.handleExceptions).toHaveBeenCalled();
    });
  });

  /* =========================
     🔹 remplaceToReturn
  ========================= */

  describe('remplaceToReturn', () => {
    it('[camino feliz] debería mapear correctamente la entidad al DTO de respuesta', () => {
      const result = service.remplaceToReturn(mockCliente);

      expect(result).toMatchObject({
        id: mockCliente.id,
        nombre: mockCliente.nombre,
        telefono: mockCliente.telefono,
        email: mockCliente.email,
        deleted: mockCliente.deleted,
      });
      expect(result.resumen).toBeDefined();
    });

    it('[camino feliz] debería incluir el resumen mapeado por resumenService.remplaceToReturn', () => {
      service.remplaceToReturn(mockCliente);

      expect(resumenServiceMock.remplaceToReturn).toHaveBeenCalledWith(mockCliente.resumen);
    });
  });
});