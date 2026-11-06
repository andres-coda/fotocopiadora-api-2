import { IsOptional, IsString } from 'class-validator';

export class DtoSolicitudResolver {
  @IsOptional()
  @IsString()
  observaciones?: string;

  // 2 = aceptada, 3 = rechazada
  estado!: number;
}