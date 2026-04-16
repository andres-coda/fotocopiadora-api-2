import { BaseDto } from "../../base/dto/baseDto";
import { DtoClienteCrear } from "../../cliente/dto/clienteCrear.dto";
import { DtoLibroPedidoCrearParcial } from "../../libro_pedido/dto/DtoCrearLibroPedido.dto";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString, IsUUID, ValidateIf, ValidateNested } from "class-validator";

export class DtoPedidoCrear extends BaseDto {
  @IsNotEmpty()
  @IsString()
  fechaEntrega!: string;

  @IsNotEmpty()
  @IsNumber()
  importeTotal!: number;

  @IsNotEmpty()
  @IsNumber()
  sena!: number;

  @IsNotEmpty()
  @IsNumber()
  anillados!: number;

  @IsNotEmpty()
  @IsNumber()
  archivos!: number;

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
  librosPedidos!: DtoLibroPedidoCrearParcial[];
}