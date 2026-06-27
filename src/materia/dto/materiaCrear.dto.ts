import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsString } from "class-validator";

export class DtoMateriaCrear extends BaseDto {
  @IsNotEmpty({message: 'La materia requiere un nombre para ser creada'})
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;
}