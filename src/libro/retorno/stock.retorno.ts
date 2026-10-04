import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";

interface StockRetornoProp extends BaseRetornoProp{
  stock: number;
}


export class StockRetorno extends BaseRetorno {
  stock!: number;

   constructor({ id, fecha_actualizacion, fecha_creacion, deleted, stock}: StockRetornoProp) {
      super({ id, fecha_actualizacion, fecha_creacion, deleted })
      this.stock = stock;
    }
}