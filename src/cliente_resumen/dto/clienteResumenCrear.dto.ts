import { BaseDto } from "../../base/dto/baseDto";
import { Estado } from "../../interface/estado.interface";
import { IsEnum, IsOptional, IsUUID } from "class-validator";

export class DtoResumenCrear extends BaseDto {
  @IsOptional()
  @IsEnum(Estado)
  estado?: Estado;

  @IsOptional()
  @IsUUID()
  cliente_id?:string;
}
