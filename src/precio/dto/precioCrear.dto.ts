import { BaseDto } from "../../base/dto/baseDto";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { PrecioAbareviatura } from "../interface/precio.interface";

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