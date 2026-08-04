import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsString } from "class-validator";
import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";

export class DtoNivelCrear extends BaseDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;
}

export class DtoNivelEditar extends BaseDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;
}


export class DtoNivelRespuesta extends DtoBaseRetorno{
  nombre!: string;
}