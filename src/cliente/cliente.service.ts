import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '@src/base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { ErroresService } from '@src/error/error.service';
import { GatewayGateway } from '@src/gateway/gateway.gateway';
import { CreateProp, EditarProp, GetDatoProp } from '@src/base/interface/base.interface';
import { Entidad, Mensaje } from '@src/gateway/dto/gatewayDto.dto';
import { Mens } from '@src/gateway/enum/Mens.enum';
import { Cliente } from './entity/cliente.entity';
import { DtoClienteCrear } from './dto/clienteCrear.dto';
import { DtoClienteEditar } from './dto/clienteEditar.dto';
import { CLIENTE_RELATIONS, CLIENTE_SELECTED } from './default/relacion';

@Injectable()
export class ClienteService extends BaseService<Cliente, DtoClienteCrear, DtoClienteEditar> {
  constructor(
    @InjectRepository(Cliente) private readonly clienteRepository: Repository<Cliente>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
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

  async createDato({ usuario, dto, qR, entidad }: CreateProp<DtoClienteCrear>): Promise<Cliente> {
    try {
      const dato: string | undefined = dto.telefono || dto.email;
      if(!dato) throw new NotFoundException('No se ha proporcionado email ni telefono para crear cliente');
      
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

      if (!qR) {
        const payload: Mensaje = {
          mensaje: Mens.CREAR,
          entidad: Entidad.CLIENTE,
          id: newCliente.id
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return newCliente;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el dato ${dto.telefono || dto.email} en el registro de ${entidad}`)
    }
  }

  async updateDato({ usuarioId, dto, qR, id, entidadError, relaciones, selected }: EditarProp<Cliente, DtoClienteEditar>): Promise<Cliente> {
    try {
      const cliente: Cliente = await this.getDatoByIdOrFail({
        id,
        usuarioId,
        qR,
        entidadError
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
          entidad: Entidad.CLIENTE,
          id: newCliente.id
        }

        this.gatewayGateway.actualizacionDato(payload);
      }

      return cliente;

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.telefono || id} en el registro de clientes`)
    }
  }
}
