import { QueryRunner } from "typeorm";



export interface GetGenericoProp{
  qR:QueryRunner;
  limite?:number;
  offset?:number;
  orden?:string;
}

export interface GetGenericoByIdProp{
  qR:QueryRunner;
  id:string;
}

export interface RetornoGenericoServiceGet<T>{
  datos: T[],
  total: number,
}

export interface RetornoGenericoControllerGet<T> extends RetornoGenericoServiceGet<T>{
  pagina: number,
  limite: number,
}