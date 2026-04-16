import { BaseDto } from "../../base/dto/baseDto";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { Especificaciones } from "../interface/especificaciones.interface";

export class DtoLibroPedidoCrearParcial extends BaseDto {
  @IsNotEmpty({ message: 'El libro pedido debe tener una cantidad' })
  @IsNumber()
  cantidad!: number;

  @IsOptional()
  @IsString({ message: 'Los detalles del libro pedido deben estar en formato string' })
  detalles?: string;

  @IsNotEmpty({ message: 'El libro pedido debe tener un libro adherido' })
  @IsUUID('4', { message: 'El id del libro debe ser un UUID válido' })
  libro_id!: string;

  @IsNotEmpty({ message: 'El libro pedido debe tener una sede adherida donde se va a realizar' })
  @IsUUID('4', { message: 'El id de la sede debe ser un UUID válido' })
  sede_id!: string;

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