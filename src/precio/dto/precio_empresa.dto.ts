import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { DtoPrecioCrear } from './precio.dto';

export class DtoPrecioEmpresaCrear extends DtoPrecioCrear{
  @IsNotEmpty({message:'El importe del precio es obligatorio para crear un nuevo precio'})
  @IsNumber()
  @Min(0)
  importe!: number;

  @IsOptional()
  @IsString({ message: 'Los detalles deben ser un texto' })
  detalles?: string;
}

export class DtoPrecioEmpresaParcialCrear {
  @IsNotEmpty({message:'El id del precio es obligatorio para crear un nuevo precio'})
  @IsUUID()
  idPrecio!: string;

  @IsNotEmpty({message:'El importe del precio es obligatorio para crear un nuevo precio'})
  @IsNumber()
  @Min(0)
  importe!: number;

  @IsOptional()
  @IsString({ message: 'Los detalles deben ser un texto' })
  detalles?: string;
}

export class DtoPrecioEmpresaEditar {
  @IsOptional()
  @IsNumber()
  @Min(0)
  importe?: number;

  @IsOptional()
  @IsString()
  detalles?: string;
}

export class DtoPrecioEmpresaRespuesta {
  idPrecio!: string;
  idEmpresa!: string;
  nombre!: string;
  descripcion?: string;
  importe!: number;
  detalles?: string;
}