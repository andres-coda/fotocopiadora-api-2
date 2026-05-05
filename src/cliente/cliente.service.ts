import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '@src/base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { CreateProp, EditarProp, GetDatoProp, UpdateRetorno } from '@src/base/interface/base.interface';
import { Entidad, Mensaje } from '@src/gateway/dto/gatewayDto.dto';
import { Mens } from '@src/gateway/enum/Mens.enum';
import { Cliente } from './entity/cliente.entity';
import { DtoClienteCrear } from './dto/clienteCrear.dto';
import { DtoClienteEditar } from './dto/clienteEditar.dto';
import { CLIENTE_RELATIONS, CLIENTE_SELECTED } from './default/relacion';
import { ClienteRetorno } from './interface/cliente_retorno.interface';
import { Estado } from '@src/interface/estado.interface';
import { ClienteResumenService } from '@src/cliente_resumen/cliente_resumen.service';
import { ClienteResumen } from '@src/cliente_resumen/entity/clienteResumen.entity';

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

  // Obtiene todos los datos activos (no eliminados) asociados a un usuario.
  // Permite definir relaciones, orden y selección de campos.
  // Si se recibe un QueryRunner, la consulta se ejecuta dentro de la transacción.
  async getDatoCx({ usuarioId }: getClientes): Promise<ClienteRetorno[]> {
    try {
      const criterio: FindManyOptions = this.crearCriterio<FindManyOptions>({
        relaciones: CLIENTE_RELATIONS,
        selected: CLIENTE_SELECTED,
        usuarioId,
        where: {
          deleted: false,
        },
      });

      const clientes: Cliente[] = await this.baseRepository.find(criterio);

      const estadosPendientes = new Set([
        Estado.PENDIENTE,
        Estado.IMPRESO_MITAD,
        Estado.IMPRESO_COMPLETO
      ]);

      const clientesRetorno: ClienteRetorno[] = clientes.map((c) => {
        let listo: number = 0;
        let pendiente: number = 0;
        let retirado: number = 0;
        c.pedidos?.forEach((p) => {
          let hayPendiente = false;
          let hayListo = false;
          p.libroPedidos?.forEach((lp) => {
            if (lp.estado === Estado.LISTO) hayListo = true;
            if (estadosPendientes.has(lp.estado)) hayPendiente = true;
          })

          if (hayPendiente) pendiente++;
          else if (hayListo) listo++;
          else retirado++;

        })
        return {
          id: c.id,
          nombre: c.nombre,
          telefono: c.telefono,
          email: c.email,
          listo,
          pendiente,
          retirado
        };
      })

      return clientesRetorno;
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer los clientes`)
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
      const dato: string | undefined = dto.telefono || dto.email;
      if (!dato) throw new NotFoundException('No se ha proporcionado email ni telefono para crear cliente');

      const clienteExistente: Cliente | null = await this.clienteExistente({
        dato,
        usuarioId: usuario.id,
        qR,
        entidadError: 'cliente'
      });

      if (clienteExistente) return clienteExistente;

      const cliente: Cliente = new Cliente();
      cliente.nombre = dto.nombre;
      cliente.telefono = dto.telefono;
      cliente.email = dto.email;
      cliente.user = usuario;

      const newCliente: Cliente = qR
        ? await qR.manager.save(Cliente, cliente)
        : await this.clienteRepository.save(cliente);

      const resumen:ClienteResumen = await this.resumenService.createDatoXEntidad({
        qR,
        usuario,
        dto:{},
        cliente:newCliente
      });

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
}
