import { BaseDto } from "@src/base/dto/baseDto";
import { IsNotEmpty, IsNumber } from "class-validator";

export class DtoStockCrear extends BaseDto {
  @IsNotEmpty()
  @IsNumber()
  stock!: number;
}
