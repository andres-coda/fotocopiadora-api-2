import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsString } from "class-validator";
import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";

export class DtoEditorialCrear extends BaseDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;
}

export class DtoEditorialEditar extends BaseDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;
}


export class DtoEditorialRespuesta extends DtoBaseRetorno{
  nombre!: string;
}