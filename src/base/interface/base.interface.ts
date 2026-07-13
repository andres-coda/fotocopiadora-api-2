import { EntidadDatoMapType } from "../../gateway/dto/gatewayDto.dto";
import { QueryRunner } from "typeorm";
import { Base } from "../entity/base.entity";
import { BaseDto } from "../dto/baseDto";
import { User } from "../../user/entity/user.entity";

/**
 * Props genéricas base.
 * Se eliminó usuarioId: el filtrado por usuario/empresa lo hace
 * el RLS de PostgreSQL usando el GUC seteado por DbContextInterceptor.
 */

export interface GenericoProp {
  qR: QueryRunner;
}

export interface GetProp<T extends Base> extends GenericoProp {
  relaciones?: RelationsKey<T>[];
  entidadError?: string;
  orden?: keyof T & string;
  selected?: SelectedDeep<T>;
  limite?: number;
  offset?: number;
}

export interface GetIdProp<T extends Base> extends Omit<GetProp<T>, 'orden' | 'limite' | 'offset'> {
  id: string;
}

export interface GetDatoProp<T extends Base> extends Omit<GetProp<T>, 'orden' | 'limite' | 'offset'> {
  dato: string;
}

export interface GetNombresProp<T extends Base> extends Omit<GetProp<T>, 'orden' | 'limite' | 'offset'> {
  nombres: string[];
}

export interface GetIdsProp<T extends Base> extends Omit<GetProp<T>, 'orden' | 'limite' | 'offset'> {
  ids: string[];
}

export interface DeletProp<T extends Base, K extends keyof EntidadDatoMapType> extends Omit<GetIdProp<T>, 'relaciones' > {
  entidad: K;
}

export interface EditarProp<T extends Base, P extends BaseDto, K extends keyof EntidadDatoMapType> extends Omit<GetProp<T>, 'orden' | 'limite' | 'offset'> {
  dto: P;
  id: string;
  entidad: K;
}

export interface EditarElementoProp<T extends Base, P extends BaseDto, K extends keyof EntidadDatoMapType> extends EditarProp<T,P, K> {}

export interface EditarElementoControllerProp<T extends Base, P extends BaseDto, K extends keyof EntidadDatoMapType> extends EditarElementoProp<T,P, K>{}

export interface CreateProp<P extends BaseDto, K extends keyof EntidadDatoMapType> extends Pick<GenericoProp, 'qR'> {
  dto: P;
  entidad: K;
}
export interface CreateDefaultProp<K extends keyof EntidadDatoMapType, P extends BaseDto> extends Omit<CreateProp<P,K>, 'dto'> {
  entidadError: string;
  defecto: P[];
}



export type RelationKeys<T> = {
  [K in keyof T]: T[K] extends object ? K : never;
}[keyof T];

type Prev<N extends number> = [never, 0, 1, 2, 3, 4, 5][N];

export type NestedRelations<T, Depth extends number = 5> = Depth extends 0
  ? never
  : {
    [K in RelationKeys<T>]?: T[K] extends Array<infer U>
    ? NestedRelations<U, Prev<Depth>>
    : T[K] extends object
    ? NestedRelations<T[K], Prev<Depth>>
    : never;
  };

export interface RelationsKey<T extends Base> {
  relations?: Array<RelationKeys<T>>;
  nestedRelations?: NestedRelations<T>;
}
export type SelectedDeep<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
  ? true | SelectedDeep<U>
  : T[K] extends object
  ? true | SelectedDeep<T[K]>
  : true;
};

export interface CriterioProp<T extends Base> {
  relaciones?: RelationsKey<T> | RelationsKey<T>[];
  selected?: SelectedDeep<T>;
  selectedBase?: SelectedDeep<T>;
  relacionBase?: RelationsKey<T>;
  orden?: keyof T & string;
  where: any;
  limite?: number;
  offset?: number;
}

export interface UpdateRetorno <T extends Base>{
  dato: T,
  isQr?: boolean,
}

export interface RetornoGet < K extends keyof EntidadDatoMapType> {
  datos: EntidadDatoMapType[K][],
  total: number,
  pagina: number,
  limite: number,
}