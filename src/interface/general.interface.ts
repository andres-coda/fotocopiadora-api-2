import { QueryRunner } from "typeorm";

type OrdenType = 'ASC' | 'DESC';

export interface GetGenericoProp{
  qR:QueryRunner;
  limite?:number;
  offset?:number;
  orden?:OrdenType;
}

export interface GetGenericoByIdProp{
  qR:QueryRunner;
  id:string;
}