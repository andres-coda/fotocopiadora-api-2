import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class DtoPrecioCrear extends BaseDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsNumber()
  importe!: number;
}