import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { DtoPrecioCrear, DtoPrecioEditar } from './precio.dto';

export class DtoPrecioEmpresaCrear extends DtoPrecioCrear{
  @IsNotEmpty({message:'El importe del precio es obligatorio para crear un nuevo precio'})
  @IsNumber()
  @Min(0)
  importe!: number;

  @IsOptional()
  @IsString({ message: 'Los detalles deben ser un texto' })
  detalles?: string;
  
  @IsOptional()
  @IsString()
  idEmpresa?: string;
}

export class DtoPrecioEmpresaEditar extends DtoPrecioEditar{
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
  fecha_creacion?: Date;
  fecha_actualizacion?:Date;
  delete!:boolean;
  descripcion?: string;
  importe!: number;
  detalles?: string;
  abreviatura?:string;
}