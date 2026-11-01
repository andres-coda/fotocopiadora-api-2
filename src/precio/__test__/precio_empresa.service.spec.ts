import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrecioEmpresaService } from '../precio_empresa.service';
import { Mens } from '@src/gateway/enum/Mens.enum';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';

/** QueryRunner falso con el manager que usan los metodos del servicio. */
const crearQueryRunner = () => ({
  manager: {
    findOne: jest.fn<(entidad: any, criterio?: any) => Promise<any>>(),
    save: jest.fn<(entidad: any, dato: any) => Promise<any>>(),
    remove: jest.fn<(entidad: any, dato: any) => Promise<any>>(),
  },
});

describe('PrecioEmpresaService', () => {
  let service: PrecioEmpresaService;
  let qR: ReturnType<typeof crearQueryRunner>;
  let gateway: { actualizacionDato: jest.Mock<(mensaje: any) => void> };
  let precioService: {
    getDatoByName: jest.Mock<(arg: any) => Promise<any>>;
    createDato: jest.Mock<(arg: any) => Promise<any>>;
    updateDato: jest.Mock<(arg: any) => Promise<any>>;
  };
  let precioCategoriaService: { createDato: jest.Mock<(arg: any) => Promise<any>> };
  let erroresService: { handleExceptions: jest.Mock<(error: any, customMessage: string) => never> };

  // Datos base reutilizados por los tests
  const precioGlobal = {
    id: 'precio-1',
    nombre: 'Anillado simple',
    descripcion: 'Anillado de 1 a 4 hojas',
    abreviatura: 'anillado_1',
  };

  const precioEmpresa = {
    id_empresa: 'emp-a',
    id_precio: 'precio-1',
    importe: 100,
    detalles: 'detalle viejo',
    precio: precioGlobal,
  };

  beforeEach(() => {
    qR = crearQueryRunner();

    gateway = { actualizacionDato: jest.fn<(mensaje: any) => void>() };

    precioService = {
      getDatoByName: jest.fn<(arg: any) => Promise<any>>(),
      createDato: jest.fn<(arg: any) => Promise<any>>(),
      updateDato: jest.fn<(arg: any) => Promise<any>>(),
    };

    precioCategoriaService = { createDato: jest.fn<(arg: any) => Promise<any>>() };

    // El servicio hace `throw this.erroresService.handleExceptions(...)`,
    // asi que el mock tiene que lanzar igual que el real.
    erroresService = {
      handleExceptions: jest.fn<(error: any, customMessage: string) => never>(
        (error: any, _customMessage: string) => {
          throw error;
        },
      ),
    };

    service = new PrecioEmpresaService(
      {} as any,
      {} as any,
      erroresService as any,
      gateway as any,
      precioService as any,
      precioCategoriaService as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPrecioEmpresa', () => {
    beforeEach(() => {
      precioService.getDatoByName.mockResolvedValue(precioGlobal);
      qR.manager.save.mockImplementation(async (_entidad: any, dato: any) => dato);
    });

    it('emite actualizacionDato una sola vez con Mens.CREAR y el PrecioRetorno', async () => {
      const retorno = await service.createPrecioEmpresa({
        dto: { nombre: 'Anillado simple', importe: 100 } as any,
        qR: qR as any,
      });

      expect(gateway.actualizacionDato).toHaveBeenCalledTimes(1);

      const [mensaje] = gateway.actualizacionDato.mock.calls[0];
      expect(mensaje.mensaje).toBe(Mens.CREAR);
      expect(mensaje.entidad).toBe(Entidad.PRECIO);
      expect(mensaje.dato).toBe(retorno);
    });

    it('no emite actualizacionDato si la creacion falla', async () => {
      qR.manager.save.mockRejectedValue(new Error('db caida'));

      await expect(
        service.createPrecioEmpresa({
          dto: { nombre: 'Anillado simple', importe: 100 } as any,
          qR: qR as any,
        }),
      ).rejects.toThrow('db caida');

      expect(gateway.actualizacionDato).not.toHaveBeenCalled();
    });
  });

  describe('updatePrecioEmpresa', () => {
    beforeEach(() => {
      qR.manager.findOne.mockResolvedValue({ ...precioEmpresa });
      qR.manager.save.mockImplementation(async (_entidad: any, dato: any) => dato);
    });

    it('emite actualizacionDato una sola vez con Mens.EDITAR y el PrecioRetorno', async () => {
      const retorno = await service.updatePrecioEmpresa({
        id: 'precio-1',
        dto: { importe: 250 } as any,
        qR: qR as any,
      });

      expect(gateway.actualizacionDato).toHaveBeenCalledTimes(1);

      const [mensaje] = gateway.actualizacionDato.mock.calls[0];
      expect(mensaje.mensaje).toBe(Mens.EDITAR);
      expect(mensaje.entidad).toBe(Entidad.PRECIO);
      expect(mensaje.dato).toBe(retorno);
    });
  });

  describe('deletePrecioEmpresa', () => {
    beforeEach(() => {
      qR.manager.findOne.mockResolvedValue({ ...precioEmpresa });
      qR.manager.remove.mockImplementation(async (_entidad: any, dato: any) => dato);
    });

    it('emite Mens.ELIMINAR con el id del precio', async () => {
      const resultado = await service.deletePrecioEmpresa({
        id: 'precio-1',
        qR: qR as any,
      });

      expect(resultado).toBe(true);
      expect(gateway.actualizacionDato).toHaveBeenCalledTimes(1);

      const [mensaje] = gateway.actualizacionDato.mock.calls[0];
      expect(mensaje.mensaje).toBe(Mens.ELIMINAR);
      expect(mensaje.entidad).toBe(Entidad.PRECIO);
      expect(mensaje.id).toBe('precio-1');
    });
  });
});
