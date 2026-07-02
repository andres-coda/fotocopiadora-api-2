import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { BaseDto } from "../../base/dto/baseDto";
import { DtoClienteCrear, DtoClienteRespuesta } from "../../cliente/dto/cliente.dto";
import { DtoLibroPedidoCrearParcial, DtoPedidoItemRespuesta } from "../../libro_pedido/dto/pedido_item.dto";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsUUID, Matches, ValidateIf, ValidateNested } from "class-validator";
import { EstadoPedido } from "../interface/estadoPedido.enum";

//---------- Dto pedido crear ------------------//

export class DtoPedidoCrear extends BaseDto {
  @IsNotEmpty()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener formato YYYY-MM-DD'
  })
  fechaEntrega!: string;

  @IsNotEmpty({message: 'El pedido debe tener un importe total'})
  @IsNumber()
  importeTotal!: number;

  @IsNotEmpty({message: 'El pedido debe tener una seña'})
  @IsNumber()
  sena!: number;

  @IsNotEmpty({message: 'El pedido debe tener la cantidad de anillados'})
  @IsInt()
  archivos!: number;

  @IsNotEmpty({message: 'El pedido debe tener la cantidad de archivos'})
  @IsInt()
  anillados!: number;

  // ✅ Se valida solo si NO viene clienteDatos
  @ValidateIf(o => !o.clienteDatos)
  @IsNotEmpty({ message: 'Debe enviar el id del cliente o los datos del cliente' })
  @IsUUID()
  cliente?: string;

  // ✅ Se valida solo si NO viene cliente
  @ValidateIf(o => !o.cliente)
  @IsNotEmpty({ message: 'Debe enviar el id del cliente o los datos del cliente' })
  @ValidateNested()
  @Type(() => DtoClienteCrear)
  clienteDatos?: DtoClienteCrear;

  @IsArray({ message: 'Debe enviar un arreglo de libros_pedidos' })
  @ArrayMinSize(1, { message: 'Debe enviar al menos un libro_pedido para ser cargado' })
  @ValidateNested({ each: true })
  @Type(() => DtoLibroPedidoCrearParcial)
  pedidoItems!: DtoLibroPedidoCrearParcial[];
}

//---------- Dto pedido editar ------------------//

export class DtoPedidoEditar extends BaseDto {
  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fechaEntrega?: string;

  @IsOptional()
  @IsNumber()
  importeTotal?: number;

  @IsOptional()
  @IsNumber()
  sena?: number;

  @IsOptional()
  @IsInt()
  anillados?: number;

  @IsOptional()
  @IsInt()
  archivos?: number;
}


//---------- Dto pedido retorno ------------------//

export class DtoPedidoEstadoRespuesta extends DtoBaseRetorno {
  estado!: EstadoPedido;
}

export class DtoPedidoRespuestaCliente extends DtoPedidoEstadoRespuesta {
  fechaEntrega!: string;
  importeTotal!: number;
  archivos!: number;
  anillados!: number;
  sena!: number;
  items!: DtoPedidoItemRespuesta[];
}

export class DtoPedidoRespuesta extends DtoPedidoRespuestaCliente {  
  cliente?: DtoClienteRespuesta;
}