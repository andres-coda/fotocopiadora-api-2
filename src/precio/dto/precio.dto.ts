import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";
import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class DtoPrecioCrear extends BaseDto {
  @IsNotEmpty({message:'El nombre es obligatorio para crear un nuevo precio'})
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;
  
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;
}


export class DtoPrecioEditar extends BaseDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre?: string;
}


export class DtoPrecioRespuesta extends DtoBaseRetorno {
  nombre!: string;
  descripcion?: string;
}