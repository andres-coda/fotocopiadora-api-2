import { BaseDto } from "@src/base/dto/baseDto";
import { DtoClienteCrear } from "@src/cliente/dto/clienteCrear.dto";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateIf, ValidateNested } from "class-validator";
import { type } from "os";

export class DtoPedidoCrear extends BaseDto {
  @IsNotEmpty()
  @IsString()
  fechaEntrega!: string;

  @IsNotEmpty()
  @IsNumber()
  importeTotal!: number;

  @IsNotEmpty()
  @IsNumber()
  sena!: number;

  @IsNotEmpty()
  @IsNumber()
  anillados!: number;

  @IsNotEmpty()
  @IsNumber()
  archivos!: number;

  // ✅ Se valida solo si NO viene clienteDatos
  @ValidateIf(o => !o.clienteDatos)
  @IsNotEmpty({ message: 'Debe enviar el id del cliente o los datos del cliente' })
  @IsUUID()
  cliente?: string;

  // ✅ Se valida solo si NO viene cliente
  @ValidateIf(o => !o.cliente)
  @IsNotEmpty({ message: 'Debe enviar el id del cliente o los datos del cliente' })
  @ValidateNested()
  @Type(() => DtoClienteCrear)
  clienteDatos?: DtoClienteCrear;
}