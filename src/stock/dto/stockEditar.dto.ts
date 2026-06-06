import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsNumber } from "class-validator";

export class DtoStockEditar extends BaseDto {
  @IsNotEmpty()
  @IsNumber()
  cantidad!: number;
}