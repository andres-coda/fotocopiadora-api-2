import { IsNotEmpty, IsNumber } from "class-validator";

export class DtoStockActualizar{
  @IsNotEmpty()
  @IsNumber()
  stock!: number;
}

export class DtoStockRespuesta{
  idLibro!: string;
  stock!: number;
  fechaActualizacion?: Date;
}
