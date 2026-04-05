import { BaseDto } from "@src/base/dto/baseDto";
import { Cliente } from "@src/cliente/entity/cliente.entity";
import { Estado } from "@src/interface/estado.interface";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsUUID, ValidateIf } from "class-validator";

export class DtoResumenCrear extends BaseDto {
  @IsOptional()
  @IsEnum(Estado)
  estado?: Estado;
}
