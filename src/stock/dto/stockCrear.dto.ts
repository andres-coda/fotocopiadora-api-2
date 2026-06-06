import { Libro } from "@src/libro/entity/libro.entity";
import { BaseDto } from "../../base/dto/baseDto";
import { IsNotEmpty, IsNumber } from "class-validator";


export class DtoManipularStock extends BaseDto {
  @IsNotEmpty()
  @IsNumber()
  stock!: number;
}


export class DtoStockCrear extends DtoManipularStock {
  libro!: Libro
}
