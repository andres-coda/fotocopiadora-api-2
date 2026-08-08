import { BaseDto } from "../../base/dto/baseDto";
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { Especificaciones } from "../interface/especificaciones.interface";
import { EstadoPedido } from "@src/pedido/interface/estadoPedido.enum";
import { DtoPedidoRespuesta } from "@src/pedido/dto/pedido.dto";
import { DtoLibroRespuesta } from "@src/libro/dto/libroRetorno.dto";
import { DtoSedeRespuesta } from "@src/sede/dto/sedeRetorno.dto";

// ------------ Dto Pedido_Item Crear ------------ //

export class DtoLibroPedidoCrearParcial extends BaseDto {
  @IsNotEmpty({ message: 'El libro pedido debe tener una cantidad' })
  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsOptional()
  @IsString({ message: 'Los detalles del libro pedido deben estar en formato string' })
  detalles?: string;

  @IsNotEmpty({ message: 'El libro pedido debe tener un libro adherido' })
  @IsUUID('4', { message: 'El id del libro debe ser un UUID válido' })
  id_libro!: string;

  @IsNotEmpty({ message: 'El libro pedido debe tener una sede adherida donde se va a realizar' })
  @IsUUID('4', { message: 'El id de la sede debe ser un UUID válido' })
  id_sede!: string;

  @IsOptional()
  @IsArray({ message: 'Debe enviar un arreglo de especificaciones' })
  @IsEnum(Especificaciones, { each: true })
  especificaciones?: Especificaciones[]
}

export class DtoLibroPedidoCrear extends DtoLibroPedidoCrearParcial {
  @IsNotEmpty({ message: 'El libro pedido debe tener el id de un pedido' })
  @IsUUID('4', { message: 'El id del pedido debe ser un UUID válido' })
  pedido_id!: string;
}


// ------------ Dto Pedido_Item Editar ------------ //

export class DtoPedidoItemEditar {
  @IsOptional()
  @IsUUID()
  libroId?: string;

  @IsOptional()
  @IsUUID()
  sedeId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;

  @IsOptional()
  @IsString({ message: 'Los detalles del libro pedido deben estar en formato string' })
  detalles?: string;

  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;

  @IsOptional()
  @IsArray({ message: 'Debe enviar un arreglo de especificaciones' })
  @IsEnum(Especificaciones, { each: true })
  especificaciones?: Especificaciones[]
}

//------- Dto cambiar estado del libro -----//

export class DtoCambiarEstadoItem {
  @IsNotEmpty()
  @IsEnum(EstadoPedido)
  estado!: EstadoPedido;
}


// ------------ Dto Pedido_Item Respuesta ------------ //

export class DtoPedidoItemRespuesta {
  idPedido!: string;
  id!: number;
  cantidad!: number;
  detalles?: string;
  estado!: EstadoPedido;
  idLibro!: string;
  pedido?: DtoPedidoRespuesta;
  libro?: DtoLibroRespuesta;
  sede?: DtoSedeRespuesta;
  idSede?: string;
  especificaciones?: Especificaciones[];
}

/* 
export class DtoPedidoItemRespuesta {
  idPedido!: string;
  id!: number;
  cantidad!: number;
  detalles?: string;
  estado!: EstadoPedido;
  idLibro!: string;
  pedido?: {
    estado: EstadoPedido;
    fechaEntrega: string;
    importeTotal: number;
    archivos: number;
    anillados: number;
    sena: number;
    items?: DtoPedidoItemRespuesta[];
    cliente?: {
      id: string;
      deleted?: boolean;
      nombre?: string;
      telefono?: string;
      email?: string;
      resumen?: {
        id: string;
        pendiente: number;
        listo: number;
        retirado: number;
        cancelado: number;
      }
    }
  }
  libro?: {
    id: string;
    deleted?: boolean;
    nombre: string;
    descripcion?: string;
    editorial?: string;
    edicion?: number;
    nivel?: string;
    cantidadPg: number;
    anio?: string;
    adhesivos?: number;
    autor?: string;
    img?: string;
    especificacionesDefecto?: Especificaciones[];
    componentes?: {
      id: string;
      deleted?: boolean;
      nombre: string;
    }[];
    materia?: {
      id: string;
      deleted?: boolean;
      nombre: string;
    };
    stock?: DtoStockRespuesta;
    propuesta?: {
      id: string;
      deleted?: boolean;
      nombre: string;
      libro?: DtoLibroRespuesta[];
    };
    componentes_texto?: string;
    resumen?: {
      listo: number,
      pendiente: number,
      retirado: number,
      cancelado: number
    };
  }
  sede?: {
      id: string;
      deleted?: boolean;
      nombre: string;
    };
  idSede?: string;
  especificaciones?: Especificaciones[];
}
 */