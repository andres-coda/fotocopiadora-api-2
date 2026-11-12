import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class DtoSolicitudResolver {
  @IsOptional()
  @IsString()
  observaciones?: string;

  // 2 = accepted, 3 = rejected
  @Type(() => Number)
  @IsInt({ message: 'El estado debe ser un número entero' })
  @IsIn([2, 3], { message: 'El estado debe ser 2 (aceptada) o 3 (rechazada)' })
  estado!: number;
}
