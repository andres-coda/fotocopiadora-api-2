import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";
import { BaseDto } from "../../base/dto/baseDto";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PrecioAbareviatura } from "../interface/precio.interface";

export class DtoPrecioCrear extends BaseDto {
  @IsNotEmpty({message:'El nombre es obligatorio para crear un nuevo precio'})
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;
  
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @IsOptional()
  @IsEnum(PrecioAbareviatura, { message: 'La abreviatura debe ser un texto y debe corresponder con las palabras preestablecidas' })
  abreviatura?: PrecioAbareviatura;  
}


export class DtoPrecioEditar extends BaseDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;
  
  @IsOptional()
  @IsEnum(PrecioAbareviatura, { message: 'La abreviatura debe ser un texto y debe corresponder con las palabras preestablecidas' })
  abreviatura?: PrecioAbareviatura;   
}


export class DtoPrecioRespuesta extends DtoBaseRetorno {
  nombre!: string;
  descripcion?: string;
  abreviatura?:PrecioAbareviatura;
}