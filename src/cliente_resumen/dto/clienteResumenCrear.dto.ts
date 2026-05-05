import { BaseDto } from "../../base/dto/baseDto";
import { Cliente } from "../../cliente/entity/cliente.entity";
import { Estado } from "../../interface/estado.interface";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsUUID, ValidateIf } from "class-validator";

export class DtoResumenCrear extends BaseDto {
  @IsOptional()
  @IsEnum(Estado)
  estado?: Estado;

  @IsOptional()
  @IsUUID()
  cliente_id?:string;
}
