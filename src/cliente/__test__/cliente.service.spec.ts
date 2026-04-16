import { Test, TestingModule } from '@nestjs/testing';
import { ClienteService } from '../cliente.service';
import { DataSource, Repository } from 'typeorm';
import { Cliente } from '../entity/cliente.entity';
import { ErroresService } from '@src/error/error.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockErrores } from 'test/mock/error.mocks';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { mockGateway } from 'test/mock/gateway.mocks';
import { mockResumenService } from 'test/mock/resumen.mock';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mockCliente } from 'test/mock/cliente.mock';
import { mockUser } from 'test/mock/user.mock';
import { createMockRepository } from 'test/mock/repo.mocks';
import { createMockQueryRunner, mockDataSource } from 'test/mock/qR.mock';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';

jest.mock('@src/cliente/entity/cliente.entity', () => ({
  Cliente: class { },
}));

jest.mock('@src/cliente_resumen/entity/clienteResumen.entity', () => ({
  ClienteResumen: class { },
}));

jest.mock('@src/base/entity/base.entity', () => ({
  Base: class { },
}));

jest.mock('@src/user/entity/user.entity', () => ({
  User: class { },
}));

const mockRepo = createMockRepository<Cliente>();
const { qr, manager } = createMockQueryRunner<Cliente>();

describe('ClienteService', () => {
  let service: ClienteService;
  let repo: Repository<Cliente>;
  let erroresService: ErroresService;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteService,
        {
          provide: getRepositoryToken(Cliente),
          useValue: mockRepo,
        },
        {
          provide: ErroresService,
          useValue: mockErrores,

        },
        {
          provide: GatewayGateway,
          useValue: mockGateway,
        },
        {
          provide: 'ClienteResumenService',
          useValue: mockResumenService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ClienteService>(ClienteService);
    repo = module.get(getRepositoryToken(Cliente));
    erroresService = module.get(ErroresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDatoByTelefono', () => {
    it('debería devolver el cliente cuando existe', async () => {
      mockRepo.findOne.mockResolvedValue(mockCliente);

      const result = await service.getDatoByTelefono({
        dato: mockCliente.telefono!,
        usuarioId: mockUser.id,
      });

      expect(result).toEqual(mockCliente);
      expect(mockRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            telefono: mockCliente.telefono,
          }),
        }),
      );
    });

    it('debería devolver null cuando no encuentra el cliente', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.getDatoByTelefono({
        dato: '0000000000',
        usuarioId: mockUser.id,
      });

      expect(result).toBeNull();
      expect(mockRepo.findOne).toHaveBeenCalled();
    });

    it('debería manejar errores usando erroresService', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockRepo.findOne.mockRejectedValue(dbError);
      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => {
          throw handledError;
        });

      await expect(
        service.getDatoByTelefono({
          dato: mockCliente.telefono!,
          usuarioId: mockUser.id,
        }),
      ).rejects.toThrow(handledError);

      expect(mockErrores.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.stringContaining('Error al intentar leer el cliente'),
      );
    });

    it('debería usar QueryRunner si se provee', async () => {
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
          where: expect.objectContaining({
            telefono: mockCliente.telefono,
          }),
        }),
      );
    });
  });

  describe('getDatoByEmail', () => {
    it('debería devolver el cliente cuando existe', async () => {
      mockRepo.findOne.mockResolvedValue(mockCliente);

      const result = await service.getDatoByEmail({
        dato: mockCliente.email!,
        usuarioId: mockUser.id,
      });

      expect(result).toEqual(mockCliente);
      expect(mockRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            email: mockCliente.email,
          }),
        }),
      );
    });

    it('debería devolver null cuando no encuentra el cliente', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.getDatoByEmail({
        dato: 'ea@email.com',
        usuarioId: mockUser.id,
      });

      expect(result).toBeNull();
      expect(mockRepo.findOne).toHaveBeenCalled();
    });

    it('debería manejar errores usando erroresService', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockRepo.findOne.mockRejectedValue(dbError);
      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => {
          throw handledError;
        });

      await expect(
        service.getDatoByEmail({
          dato: mockCliente.email!,
          usuarioId: mockUser.id,
        }),
      ).rejects.toThrow(handledError);

      expect(mockErrores.handleExceptions).toHaveBeenCalledWith(
        dbError,
        expect.stringContaining('Error al intentar leer el cliente'),
      );
    });

    it('debería usar QueryRunner si se provee', async () => {
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
          where: expect.objectContaining({
            email: mockCliente.email,
          }),
        }),
      );
    });
  });

  describe('clienteExistente', () => {

    it('debería devolver cliente si lo encuentra por teléfono', async () => {
      jest.spyOn(service, 'getDatoByTelefono').mockResolvedValue(mockCliente);
      jest.spyOn(service, 'getDatoByEmail').mockResolvedValue(null);

      const result = await service.clienteExistente({
        dato: '1234567890',
        usuarioId: mockUser.id
      });

      expect(result).toEqual(mockCliente);
      expect(service.getDatoByTelefono).toHaveBeenCalled();
      expect(service.getDatoByEmail).not.toHaveBeenCalled();
    });

    it('debería buscar por email si no encuentra por teléfono', async () => {
      jest.spyOn(service, 'getDatoByTelefono').mockResolvedValue(null);
      jest.spyOn(service, 'getDatoByEmail').mockResolvedValue(mockCliente);

      const result = await service.clienteExistente({
        dato: 'cliente@ej.com',
        usuarioId: mockUser.id
      });

      expect(result).toEqual(mockCliente);
      expect(service.getDatoByTelefono).toHaveBeenCalled();
      expect(service.getDatoByEmail).toHaveBeenCalled();
    });

    it('debería devolver null si no encuentra ni por teléfono ni email', async () => {
      jest.spyOn(service, 'getDatoByTelefono').mockResolvedValue(null);
      jest.spyOn(service, 'getDatoByEmail').mockResolvedValue(null);

      const result = await service.clienteExistente({
        dato: 'noexiste',
        usuarioId: mockUser.id
      });

      expect(result).toBeNull();
    });

    it('debería manejar error si falla getDatoByTelefono', async () => {
      const error = new Error('fail telefono');

      jest.spyOn(service, 'getDatoByTelefono').mockRejectedValue(error);
      jest.spyOn(erroresService, 'handleExceptions').mockImplementation(() => {
        throw error;
      });;

      await expect(
        service.clienteExistente({
          dato: '123',
          usuarioId: mockUser.id
        })
      ).rejects.toThrow(error);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });

    it('debería manejar error si falla getDatoByEmail', async () => {
      const error = new Error('fail email');

      jest.spyOn(service, 'getDatoByTelefono').mockResolvedValue(null);
      jest.spyOn(service, 'getDatoByEmail').mockRejectedValue(error);
      jest.spyOn(erroresService, 'handleExceptions').mockImplementation(() => {
        throw error;
      });;

      await expect(
        service.clienteExistente({
          dato: 'mail@test.com',
          usuarioId: mockUser.id
        })
      ).rejects.toThrow(error);

      expect(service.getDatoByEmail).toHaveBeenCalled();
      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });

    it('debería pasar QueryRunner a los métodos internos', async () => {
      const mockQR = {
        manager: {
          findOne: jest.fn()
        }
      } as any;

      jest.spyOn(service, 'getDatoByTelefono').mockResolvedValue(null);
      jest.spyOn(service, 'getDatoByEmail').mockResolvedValue(mockCliente);

      await service.clienteExistente({
        dato: 'cliente@ej.com',
        usuarioId: mockUser.id,
        qR: mockQR
      });

      expect(service.getDatoByTelefono).toHaveBeenCalledWith(
        expect.objectContaining({ qR: mockQR })
      );

      expect(service.getDatoByEmail).toHaveBeenCalledWith(
        expect.objectContaining({ qR: mockQR })
      );
    });

  });

  describe('createDato', () => {

    it('debería crear cliente con telefono (camino feliz)', async () => {
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(null);
      mockRepo.save.mockResolvedValue(mockCliente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: { nombre: 'Test', telefono: '1234567890' },
        entidad: Entidad.CLIENTE
      });

      expect(result).toEqual(mockCliente);
      expect(service.clienteExistente).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).toHaveBeenCalled();
    });

    it('debería crear cliente con email si no hay telefono', async () => {
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(null);
      mockRepo.save.mockResolvedValue(mockCliente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: { nombre: 'Test', email: 'test@mail.com' },
        entidad: Entidad.CLIENTE
      });

      expect(result).toEqual(mockCliente);
      expect(service.clienteExistente).toHaveBeenCalledWith(
        expect.objectContaining({ dato: 'test@mail.com' })
      );
    });

    it('debería devolver cliente existente si ya existe', async () => {
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(mockCliente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: { nombre: 'Test', telefono: '1234567890' },
        entidad: Entidad.CLIENTE
      });

      expect(result).toEqual(mockCliente);
      expect(mockRepo.save).not.toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('debería lanzar error si no se proporciona telefono ni email', async () => {
      const error = new Error('No se ha proporcionado email ni telefono');

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw error });

      await expect(
        service.createDato({
          usuario: mockUser,
          dto: { nombre: 'Test' },
          entidad: Entidad.CLIENTE
        })
      ).rejects.toThrow(error);
    });

    it('debería usar QueryRunner si se provee', async () => {
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(null);
      manager.save.mockResolvedValue(mockCliente);

      const result = await service.createDato({
        usuario: mockUser,
        dto: { nombre: 'Test', telefono: '1234567890' },
        entidad: Entidad.CLIENTE,
        qR: qr
      });

      expect(result).toEqual(mockCliente);
      expect(manager.save).toHaveBeenCalled();
      expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
    });

    it('debería llamar al gateway cuando no hay QueryRunner', async () => {
      jest.spyOn(service, 'clienteExistente').mockResolvedValue(null);
      mockRepo.save.mockResolvedValue(mockCliente);

      await service.createDato({
        usuario: mockUser,
        dto: { nombre: 'Test', telefono: '1234567890' },
        entidad: Entidad.CLIENTE
      });

      expect(mockGateway.actualizacionDato).toHaveBeenCalledWith(
        expect.objectContaining({
          mensaje: expect.anything(),
          entidad: Entidad.CLIENTE,
          dato: mockCliente
        })
      );
    });

    it('debería manejar errores del repositorio', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(service, 'clienteExistente').mockResolvedValue(null);
      mockRepo.save.mockRejectedValue(dbError);

      jest.spyOn(erroresService, 'handleExceptions')
        .mockImplementation(() => { throw handledError });

      await expect(
        service.createDato({
          usuario: mockUser,
          dto: { nombre: 'Test', telefono: '1234567890' },
          entidad: Entidad.CLIENTE
        })
      ).rejects.toThrow(handledError);

      expect(erroresService.handleExceptions).toHaveBeenCalled();
    });

  });

  describe('updateDato', () => {

  it('debería actualizar el cliente (camino feliz)', async () => {
    jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue({ ...mockCliente });
    mockRepo.save.mockResolvedValue(mockCliente);

    const dto = { nombre: 'Nuevo Nombre' };

    const result = await service.updateDato({
      id: mockCliente.id,
      usuarioId: mockUser.id,
      dto,
      entidad: Entidad.CLIENTE
    });

    expect(result).toEqual({
      dato: mockCliente,
      isQr: true
    });

    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockGateway.actualizacionDato).toHaveBeenCalled();
  });

  it('debería actualizar solo los campos enviados (update parcial)', async () => {
    const clienteBase = { ...mockCliente };

    jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(clienteBase);
    mockRepo.save.mockResolvedValue(clienteBase);

    const dto = { nombre: 'Nuevo Nombre' };

    await service.updateDato({
      id: mockCliente.id,
      usuarioId: mockUser.id,
      dto,
      entidad: Entidad.CLIENTE
    });

    expect(clienteBase.nombre).toBe('Nuevo Nombre');
    expect(clienteBase.telefono).toBe(mockCliente.telefono);
    expect(clienteBase.email).toBe(mockCliente.email);
  });

  it('debería usar QueryRunner si se provee', async () => {
    const clienteBase = { ...mockCliente };

    jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue(clienteBase);
    manager.save.mockResolvedValue(clienteBase);

    const result = await service.updateDato({
      id: mockCliente.id,
      usuarioId: mockUser.id,
      dto: { nombre: 'Nuevo Nombre' },
      entidad: Entidad.CLIENTE,
      qR: qr
    });

    expect(result).toEqual({
      dato: clienteBase,
      isQr: true
    });

    expect(manager.save).toHaveBeenCalled();
    expect(mockGateway.actualizacionDato).not.toHaveBeenCalled();
  });

  it('debería llamar al gateway si no hay QueryRunner', async () => {
    jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue({ ...mockCliente });
    mockRepo.save.mockResolvedValue(mockCliente);

    await service.updateDato({
      id: mockCliente.id,
      usuarioId: mockUser.id,
      dto: { nombre: 'Nuevo Nombre' },
      entidad: Entidad.CLIENTE
    });

    expect(mockGateway.actualizacionDato).toHaveBeenCalledWith(
      expect.objectContaining({
        mensaje: expect.anything(),
        entidad: Entidad.CLIENTE,
        dato: mockCliente
      })
    );
  });

  it('debería manejar error si falla getDatoByIdOrFail', async () => {
    const error = new Error('not found');

    jest.spyOn(service, 'getDatoByIdOrFail').mockRejectedValue(error);

    jest.spyOn(erroresService, 'handleExceptions')
      .mockImplementation(() => { throw error });

    await expect(
      service.updateDato({
        id: '1',
        usuarioId: mockUser.id,
        dto: {},
        entidad: Entidad.CLIENTE
      })
    ).rejects.toThrow(error);

    expect(erroresService.handleExceptions).toHaveBeenCalled();
  });

  it('debería manejar error si falla el save', async () => {
    const dbError = new Error('DB error');
    const handledError = new Error('Handled error');

    jest.spyOn(service, 'getDatoByIdOrFail').mockResolvedValue({ ...mockCliente });
    mockRepo.save.mockRejectedValue(dbError);

    jest.spyOn(erroresService, 'handleExceptions')
      .mockImplementation(() => { throw handledError });

    await expect(
      service.updateDato({
        id: mockCliente.id,
        usuarioId: mockUser.id,
        dto: { nombre: 'Nuevo Nombre' },
        entidad: Entidad.CLIENTE
      })
    ).rejects.toThrow(handledError);

    expect(erroresService.handleExceptions).toHaveBeenCalled();
  });

});
});