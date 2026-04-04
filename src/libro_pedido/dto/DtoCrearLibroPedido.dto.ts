import { BaseDto } from "@src/base/dto/baseDto";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { Especificaciones } from "../interface/especificaciones.interface";

export class DtoLibroPedidoCrearParcial extends BaseDto {
  @IsNotEmpty()
  @IsNumber()
  cantidad!: number;

  @IsOptional()
  @IsString()
  detalles?: string;

  @IsNotEmpty()
  @IsUUID()
  libro_id!: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Especificaciones, { each: true })
  especificaciones?: Especificaciones[]
}

export class DtoLibroPedidoCrear extends DtoLibroPedidoCrearParcial{  
  @IsNotEmpty()
  @IsUUID()
  pedido_id!: string;

}