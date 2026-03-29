import { BaseDto } from "@src/base/dto/baseDto";
import { IsNotEmpty, IsString } from "class-validator";

export class DtoSedeCrear extends BaseDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;
}