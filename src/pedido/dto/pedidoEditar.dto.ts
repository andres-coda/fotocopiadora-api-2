import { BaseDto } from "../../base/dto/baseDto";
import { DtoLibroPedidoCrearParcial } from "../../libro_pedido/dto/DtoCrearLibroPedido.dto";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class DtoPedidoEditar extends BaseDto {
  @IsOptional()
  @IsString()
  fechaEntrega?: string;

  @IsOptional()
  @IsNumber()
  importeTotal?: number;

  @IsOptional()
  @IsNumber()
  sena?: number;

  @IsOptional()
  @IsNumber()
  anillados?: number;

  @IsOptional()
  @IsNumber()
  archivos?: number;

  @IsArray({ message: 'Debe enviar un arreglo de libros_pedidos' })
  @ArrayMinSize(1, { message: 'Debe enviar al menos un libro_pedido para ser cargado' })
  @ValidateNested({ each: true })
  @Type(() => DtoLibroPedidoCrearParcial)
  librosPedidos!: DtoLibroPedidoCrearParcial[];
}