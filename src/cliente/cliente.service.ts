import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, GetDatoProp, GetProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Mens } from '../gateway/enum/Mens.enum';
import { Cliente } from './entity/cliente.entity';
import { DtoClienteCrear } from './dto/clienteCrear.dto';
import { DtoClienteEditar } from './dto/clienteEditar.dto';
import { CLIENTE_RELATIONS, CLIENTE_SELECTED, CLIENTE_X_RESUMEN_RELATIONS, CLIENTE_X_RESUMEN_SELECTED } from './default/relacion';
import { ClienteRetorno } from './interface/cliente_retorno.interface';
import { Estado } from '../interface/estado.interface';
import { ClienteResumenService } from '../cliente_resumen/cliente_resumen.service';
import { ClienteResumen } from '../cliente_resumen/entity/clienteResumen.entity';
import { DtoClienteRespuesta } from './dto/clienteRespuesta.dto';

interface getClientes {
  usuarioId: string;
}

@Injectable()
export class ClienteService extends BaseService<typeof Entidad.CLIENTE, Cliente, DtoClienteCrear, DtoClienteEditar> {
  constructor(
    @InjectRepository(Cliente) private readonly clienteRepository: Repository<Cliente>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
    @Inject(forwardRef(() => ClienteResumenService))
    private readonly resumenService: ClienteResumenService,
  ) {
    super(clienteRepository, dataSource, erroresService, gatewayGateway)
  }

  // Obtiene un cliente a partir de su telefono.
  // Permite incluir relaciones y selección parcial de campos mediante los
  // parámetros recibidos.
  // Si se proporciona un QueryRunner, la consulta se ejecuta dentro de una
  // transacción activa; de lo contrario, se realiza directamente sobre
  // el repositorio.
  // Devuelve el elemento encontrado o null si no existe.
  // No lanza excepción cuando el dato no existe, únicamente ante errores
  // inesperados de acceso a datos.
  async getDatoByTelefono({ dato, usuarioId, qR, relaciones, selected }: GetDatoProp<Cliente>): Promise<Cliente | null> {
    try {
      const criterio: FindOneOptions = this.crearCriterio<FindOneOptions>({
        relaciones,
        selected,
        where: { telefono: dato },
        usuarioId,
      });

      return qR
        ? qR.manager.findOne(Cliente, criterio)
        : await this.baseRepository.findOne(criterio);

    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el cliente con telefono ${dato}`)
    }
  }

  // Obtiene un elemento a partir de su email.
  // Permite incluir relaciones y selección parcial de campos mediante los
  // parámetros recibidos.
  // Si se proporciona un QueryRunner, la consulta se ejecuta dentro de una
  // transacción activa; de lo contrario, se realiza directamente sobre
  // el repositorio.
  // Devuelve el elemento encontrado o null si no existe.
  // No lanza excepción cuando el dato no existe, únicamente ante errores
  // inesperados de acceso a datos.
  async getDatoByEmail({ dato, usuarioId, qR, relaciones, selected }: GetDatoProp<Cliente>): Promise<Cliente | null> {
    try {
      const criterio: FindOneOptions = this.crearCriterio<FindOneOptions>({
        relaciones,
        selected,
        where: { email: dato },
        usuarioId,
      });

      return qR
        ? qR.manager.findOne(Cliente, criterio)
        : await this.baseRepository.findOne(criterio);

    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el cliente con email ${dato}`)
    }
  }

  async clienteExistente({ dato, usuarioId, qR, relaciones, selected }: GetDatoProp<Cliente>): Promise<Cliente | null> {
    try {
      const cliente: Cliente | null = await this.getDatoByTelefono({ dato, usuarioId, qR, relaciones, selected });
      if (cliente) return cliente;

      return await this.getDatoByEmail({ dato, usuarioId, qR, relaciones, selected });

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar encontrar el cliente ${dato} `)
    }
  }

  /**
 * Crea un nuevo cliente asociado a un usuario.
 *
 * Flujo:
 * 1. Valida que el DTO contenga al menos un identificador (telefono o email).
 * 2. Verifica si ya existe un cliente con ese dato (telefono/email) para el usuario.
 *    - Si existe, retorna ese cliente sin crear uno nuevo.
 * 3. Si no existe:
 *    - Instancia un nuevo cliente
 *    - Asigna propiedades desde el DTO
 *    - Persiste en base de datos (con o sin QueryRunner)
 * 4. Si la operación NO está dentro de una transacción:
 *    - Emite un evento vía Gateway notificando la creación
 *
 * Soporte de transacciones:
 * - Si se provee un QueryRunner, todas las operaciones se ejecutan dentro de la transacción.
 * - Si no se provee, se utiliza el repositorio directamente.
 *
 * Manejo de errores:
 * - Cualquier error es capturado y transformado mediante erroresService.
 *
 * @param usuario - Usuario propietario del cliente
 * @param dto - Datos para crear el cliente
 * @param entidad - Nombre de la entidad para logging/eventos
 * @param qR - QueryRunner opcional para transacciones
 *
 * @returns Cliente existente o recién creado
 *
 * @throws HttpException - Si ocurre un error en la operación
 */
  async createDato({ usuario, dto, qR, entidad }: CreateProp<DtoClienteCrear, typeof Entidad.CLIENTE>): Promise<Cliente> {
    try {
      dto.telefono = dto.telefono?.trim() || undefined;
      dto.email = dto.email?.trim() || undefined;
      const dato: string | undefined = dto.telefono || dto.email;

      if (!dato) throw new NotFoundException('No se ha proporcionado email ni telefono para crear cliente');

      const clienteExistente: Cliente | null = await this.clienteExistente({
        dato,
        usuarioId: usuario.id,
        qR,
        entidadError: 'cliente',
        relaciones: [CLIENTE_X_RESUMEN_RELATIONS],
        selected: CLIENTE_X_RESUMEN_SELECTED
      });

      if (clienteExistente) {
        if (dto.vienePedido) {
          const resumen: UpdateRetorno<ClienteResumen> = await this.resumenService.updateDato({
            id: clienteExistente.resumen.id,
            usuarioId: usuario.id,
            dto: { actual: Estado.PENDIENTE },
            qR,
            entidadError: 'resumen de cliente',
            entidad: Entidad.RESUMEN,
          });
          clienteExistente.resumen = resumen.dato;
        }
        return clienteExistente;
      }

      const cliente: Cliente = new Cliente();
      cliente.nombre = dto.nombre;
      cliente.telefono = dto.telefono;
      cliente.email = dto.email;
      cliente.user = usuario;

      const newCliente: Cliente = qR
        ? await qR.manager.save(Cliente, cliente)
        : await this.clienteRepository.save(cliente);

      const resumen: ClienteResumen = await this.resumenService.createDatoXEntidad({
        qR,
        usuario,
        dto: {},
        cliente: newCliente
      });

      newCliente.resumen = resumen;

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad: entidad,
          dato: newCliente
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return newCliente;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.telefono || dto.email} en el registro de ${entidad}`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Cliente, DtoClienteEditar, typeof Entidad.CLIENTE>): Promise<UpdateRetorno<Cliente>> {
    try {
      const cliente: Cliente = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        entidadError,
        relaciones,
        selected
      });

      dto.telefono = dto.telefono?.trim() || undefined;
      dto.email = dto.email?.trim() || undefined;

      cliente.nombre = dto.nombre || cliente.nombre;
      cliente.telefono = dto.telefono || cliente.telefono;
      cliente.email = dto.email || cliente.email;

      const newCliente: Cliente = qR
        ? await qR.manager.save(Cliente, cliente)
        : await this.clienteRepository.save(cliente);

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.EDITAR,
          entidad: entidad,
          dato: newCliente
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return { dato: newCliente, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.telefono || id} en el registro de clientes`)
    }
  }

  remplaceToReturn(entidad: Cliente): DtoClienteRespuesta {
    const base = this.remplaceToBase(entidad);
    const resumen = entidad.resumen
      ? this.resumenService.remplaceToReturn(entidad.resumen)
      : undefined;
    return {
      ...base,

      nombre: entidad.nombre,
      telefono: entidad.telefono,
      email: entidad.email,

      resumen
    };
  };
}
