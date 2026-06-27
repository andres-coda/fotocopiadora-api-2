import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

/*
export class DtoPrecioCrear extends BaseDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsNumber()
  importe!: number;

  @IsOptional()
  @IsArray()
  @IsEnum(PrecioAbareviatura, { each: true })
  abreviatura?: PrecioAbareviatura[];
}
*/


export class DtoPrecioCrear extends BaseDto {
  @IsNotEmpty({message:'El nombre es obligatorio para crear un nuevo precio'})
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;
  
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;
}