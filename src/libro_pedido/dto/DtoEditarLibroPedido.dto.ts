import { BaseDto } from "../../base/dto/baseDto";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { Especificaciones } from "../interface/especificaciones.interface";
import { Estado } from "../../interface/estado.interface";

export class DtoLibroPedidoEditar extends BaseDto {
  @IsOptional()
  @IsNumber()
  cantidad?: number;

  @IsOptional()
  @IsEnum(Estado)
  estado?: Estado;

  @IsOptional()
  @IsString({ message: 'Los detalles del libro pedido deben estar en formato string' })
  detalles?: string;

  @IsOptional()
  @IsUUID()
  libro_id?: string;

  @IsOptional()
  @IsUUID()
  sede_id?: string;

  @IsOptional()
  @IsArray({ message: 'Debe enviar un arreglo de especificaciones' })
  @IsEnum(Especificaciones, { each: true })
  especificaciones?: Especificaciones[]
}