import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsString } from "class-validator";

export class DtoMateriaCrear extends BaseDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;
}