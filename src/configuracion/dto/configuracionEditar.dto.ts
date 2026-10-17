import { BaseDto } from "@src/base/dto/baseDto";
import { IsBoolean, IsDateString, IsInt, IsOptional, IsUUID, Matches, Max, Min } from "class-validator";

/**
 * Edicion de la configuracion de la empresa.
 * Todos los campos son opcionales: solo se aplican los que vienen definidos.
 * Nunca se aceptan idEmpresa ni fechaActualizacion: la PK no se edita y
 * la fecha la setea el servicio.
 */
export class DtoConfiguracionEditar extends BaseDto {

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de entrega debe ser una fecha valida' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha de entrega debe tener formato YYYY-MM-DD' })
  fechaEntrega?: string;

  @IsOptional()
  @IsInt({ message: 'La hora de entrega debe ser un numero entero' })
  @Min(0, { message: 'La hora de entrega no puede ser menor a 0' })
  @Max(23, { message: 'La hora de entrega no puede ser mayor a 23' })
  horaEntrega?: number;

  @IsOptional()
  @IsUUID('4', { message: 'El id de sede debe ser un UUID valido' })
  idSede?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El id de dato de cobro debe ser un UUID valido' })
  idDatoCobro?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El id de mensaje de pedido tomado debe ser un UUID valido' })
  idMsjPedidoTomado?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El id de mensaje de pedido retirado debe ser un UUID valido' })
  idMsjPedidoRetirado?: string;

  @IsOptional()
  @IsBoolean({ message: 'msjRetiro debe ser un booleano' })
  msjRetiro?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'msjEnvio debe ser un booleano' })
  msjEnvio?: boolean;
}
