import { BaseDto } from "@src/base/dto/baseDto";
import { IsOptional, IsString } from "class-validator";

export class DtoSedeEditar extends BaseDto {
  @IsOptional()
  @IsString()
  nombre?: string;
}