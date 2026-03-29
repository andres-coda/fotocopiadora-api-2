import { BaseDto } from "@src/base/dto/baseDto";
import { IsOptional, IsString } from "class-validator";

export class DtoMateriaEditar extends BaseDto {
  @IsOptional()
  @IsString()
  nombre?: string;
}