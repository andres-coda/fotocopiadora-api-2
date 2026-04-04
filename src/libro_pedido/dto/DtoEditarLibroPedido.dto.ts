import { BaseDto } from "@src/base/dto/baseDto";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { Especificaciones } from "../interface/especificaciones.interface";
import { Estado } from "@src/interface/estado.interface";

export class DtoLibroPedidoEditar extends BaseDto {
  @IsOptional()
  @IsNumber()
  cantidad!: number;

  @IsOptional()
  @IsEnum(Estado)
  estado!: Estado;

  @IsOptional()
  @IsString()
  detalles?: string;

  @IsOptional()
  @IsUUID()
  libro_id!: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Especificaciones, { each: true })
  especificaciones?: Especificaciones[]
}