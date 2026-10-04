import { IsNotEmpty, IsNumber } from "class-validator";

export class DtoStockActualizar{
  @IsNotEmpty()
  @IsNumber()
  stock!: number;
}

