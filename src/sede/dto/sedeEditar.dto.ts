import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class DtoSedeEditar extends BaseDto {
  @IsNotEmpty({message:'El nombre es obligatorio para editar sede'})
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;
}