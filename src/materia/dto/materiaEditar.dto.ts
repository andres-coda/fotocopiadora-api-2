import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsString } from "class-validator";

export class DtoMateriaEditar extends BaseDto {
  @IsNotEmpty({message: 'La materia requiere un nombre para ser editada'})
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;
}