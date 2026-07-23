import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { ErroresService } from '../error/error.service';
import { GatewayGateway } from '../gateway/gateway.gateway';
import { CreateProp, EditarProp, GetDatoProp, GetProp, UpdateRetorno } from '../base/interface/base.interface';
import { Entidad, Mensaje } from '../gateway/dto/gatewayDto.dto';
import { Cliente } from './entity/cliente.entity';
import { DtoClienteCrear, DtoClienteEditar, DtoClienteRespuesta } from './dto/cliente.dto';
import { CLIENTE_RELATIONS, CLIENTE_X_RESUMEN_SELECTED } from './default/relacion';
import { clienteResumenRespuesta } from './dto/cliente_resumen.dto';
import { RetornoGenericoServiceGet } from '@src/interface/general.interface';
import { toRespuestaClienteXbusqueda } from './utils/toRespuestaCliente';
import { ClienteRetorno } from './interface/cliente_retorno.interface';
import { ClienteResumen } from './entity/clienteResumen.entity';
import { Mens } from '@src/gateway/enum/Mens.enum';

interface getClientes {
  usuarioId: string;
}

interface DeshacerEliminarProp{
  qR:QueryRunner;
  cliente: Cliente;
}

@Injectable()
export class ClienteService extends BaseService<typeof Entidad.CLIENTE, Cliente, DtoClienteCrear, DtoClienteEditar> {
  constructor(
    @InjectRepository(Cliente) private readonly clienteRepository: Repository<Cliente>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly erroresService: ErroresService,
    protected readonly gatewayGateway: GatewayGateway,
  ) {
    super(clienteRepository, dataSource, erroresService, gatewayGateway)
  }

  async getDato({ qR, relaciones = [], entidadError = undefined, orden = undefined, selected = undefined, limite, offset }: GetProp<Cliente>): Promise<RetornoGenericoServiceGet<Cliente>> {
    try {
      const criterio: FindManyOptions = {
        relations: ['resumen'],
        where: { deleted: false },
        order: {
          'resumen': {
            'pendiente': 'ASC'
          }
        },
        take: limite ?? 20,
        skip: offset ?? 0
      }

      const [datos, total] = await qR.manager.findAndCount(Cliente, criterio);

      return { datos, total };
    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer los datos ${entidadError && `de ${entidadError}`}`)
    }
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
  async getDatoByTelefono({ dato, qR, relaciones, selected }: GetDatoProp<Cliente>): Promise<Cliente | null> {
    try {
      const criterio: FindOneOptions = this.crearCriterio<FindOneOptions>({
        relaciones,
        selected,
        where: { telefono: dato },
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
  async getDatoByEmail({ dato, qR, relaciones, selected }: GetDatoProp<Cliente>): Promise<Cliente | null> {
    try {
      const criterio: FindOneOptions = this.crearCriterio<FindOneOptions>({
        relaciones,
        selected,
        where: { email: dato },
      });

      return qR
        ? qR.manager.findOne(Cliente, criterio)
        : await this.baseRepository.findOne(criterio);

    } catch (error) {
      throw this.erroresService.handleExceptions(error, `Error al intentar leer el cliente con email ${dato}`)
    }
  }

  async clienteExistente({ dato, qR, relaciones, selected }: GetDatoProp<Cliente>): Promise<Cliente | null> {
    try {
      const cliente: Cliente | null = await this.getDatoByTelefono({ dato, qR, relaciones, selected });
      if (cliente) return cliente;

      return await this.getDatoByEmail({ dato, qR, relaciones, selected });

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar encontrar el cliente ${dato} `)
    }
  }

  /**
   * Búsqueda flexible de clientes usando fc_busqueda_cliente() de la BD.
   * Detecta automáticamente si la búsqueda es por nombre o teléfono.
   */
  async buscarClientes(
    busqueda: string,
    limite = 20,
    offset = 0,
    qR: QueryRunner,
  ): Promise<RetornoGenericoServiceGet<DtoClienteRespuesta>> {
    try {


      const rows = await qR.query(
        `SELECT * FROM fc_busqueda_cliente($1, $2, $3)`,
        [busqueda, limite, offset],
      );

      return {
        total: Number(rows[0]?.total ?? 0),
        datos: rows.map((r: ClienteRetorno) => toRespuestaClienteXbusqueda(r)),
      }
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al buscar clientes`);
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
 * @param dto - Datos para crear el cliente
 * @param entidad - Nombre de la entidad para logging/eventos
 * @param qR - QueryRunner opcional para transacciones
 *
 * @returns Cliente existente o recién creado
 *
 * @throws HttpException - Si ocurre un error en la operación
 */
  async createDato({ dto, qR, entidad }: CreateProp<DtoClienteCrear, typeof Entidad.CLIENTE>): Promise<Cliente> {
    try {
      dto.telefono = dto.telefono?.trim() || undefined;
      dto.email = dto.email?.trim() || undefined;
      const dato: string | undefined = dto.telefono || dto.email;

      if (!dato) throw new NotFoundException('No se ha proporcionado email ni telefono para crear cliente');

      const clienteExistente: Cliente | null = await this.clienteExistente({
        dato,
        qR,
        entidadError: 'cliente',
        relaciones: [CLIENTE_RELATIONS],
        selected: CLIENTE_X_RESUMEN_SELECTED
      });

      if(clienteExistente) return clienteExistente;
    
      const cliente: Cliente = new Cliente();
      cliente.nombre = dto.nombre;
      cliente.telefono = dto.telefono;
      cliente.email = dto.email;

      const newCliente: Cliente = await qR.manager.save(Cliente, cliente);

      return newCliente;
    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar crear el cliente ${dto.telefono || dto.email}`)
    }
  }

  async deshacerEliminar({cliente, qR}:DeshacerEliminarProp):Promise<Cliente>{
    try{
      if(!cliente.deleted) return cliente;
      cliente.deleted = false;
      const newCliente:Cliente = await qR.manager.save(Cliente, cliente);

      return newCliente;
    } catch(er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar deshacer eliminar del cliente ${cliente.telefono ?? cliente.email}`)
    }
  }

  async createDatoCx({ dto, entidad, qR }: CreateProp<DtoClienteCrear, typeof Entidad.CLIENTE>): Promise<DtoClienteRespuesta> {
    try {
      const newElemento: Cliente = await this.createDato({ dto, qR, entidad });
      const newCliente:Cliente = await this.getDatoByIdOrFail({
        id: newElemento.id,
        qR,
        relaciones:[CLIENTE_RELATIONS],
        selected: CLIENTE_X_RESUMEN_SELECTED
      });

      if (!newCliente) throw new NotFoundException('No se encontro el resumen para el nuevo cliente');
      
      const retorno: DtoClienteRespuesta | undefined = this.remplaceToReturn(newCliente);

      if (!retorno) throw new NotFoundException(`No se pudo crear el cliente ${dto.telefono ?? dto.email}`);

      this.gateway.actualizacionDato({
        mensaje: Mens.CREAR,
        entidad,
        dato: retorno,
      } as Mensaje);

      return retorno;
    } catch (error) {
      throw this.erroresService.handleExceptions(
        error,
        `Error al intentar crear el nuevo cliente`,
      );
    }
  }

  async updateDato({ dto, qR, id, entidadError, relaciones, selected, entidad }: EditarProp<Cliente, DtoClienteEditar, typeof Entidad.CLIENTE>): Promise<UpdateRetorno<Cliente>> {
    try {
      const cliente: Cliente = await this.getDatoByIdOrFail({
        id,
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

      return { dato: newCliente, isQr: true }

    } catch (er) {
      throw this.erroresService.handleExceptions(er, `Error al intentar editar el dato ${dto.telefono || id} en el registro de clientes`)
    }
  }

  remplaceToReturn(entidad: Cliente): DtoClienteRespuesta {
    const base = this.remplaceToBase(entidad);
    return {
      ...base,
      nombre: entidad.nombre,
      telefono: entidad.telefono,
      email: entidad.email,
      resumen: clienteResumenRespuesta(entidad.resumen)
    };
  };
}
