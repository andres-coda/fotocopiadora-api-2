import { QueryRunner } from "typeorm";

export interface CreateGenericoProp<T>{
  dto:T;
  qR:QueryRunner;
}

export interface UpdateGenericoProp<T> extends CreateGenericoProp<T>{
  id:string;
}

export interface BusquedaGenericoProp{
  limite?: number,
  offset?: number,
  qR: QueryRunner,
  busqueda: string,
}

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