import { EntidadDatoMapType } from "../../gateway/dto/gatewayDto.dto";
import { QueryRunner } from "typeorm";
import { Base } from "../entity/base.entity";
import { BaseDto } from "../dto/baseDto";
import { User } from "../../user/entity/user.entity";

export interface GenericoProp {
  usuarioId: string;
  qR?: QueryRunner;
}

export interface GetProp<T extends Base> extends GenericoProp {
  relaciones?: RelationsKey<T>[];
  entidadError?: string;
  orden?: keyof T & string;
  selected?: SelectedDeep<T>
}

export interface GetIdProp<T extends Base> extends Omit<GetProp<T>, 'orden'> {
  id: string;
}

export interface GetDatoProp<T extends Base> extends Omit<GetProp<T>, 'orden'> {
  dato: string;
}

export interface GetNombresProp<T extends Base> extends Omit<GetProp<T>, 'orden'> {
  nombres: string[];
}

export interface GetIdsProp<T extends Base> extends Omit<GetProp<T>, 'orden'> {
  ids: string[];
}

export interface DeletProp<T extends Base, K extends keyof EntidadDatoMapType> extends Omit<GetIdProp<T>, 'relaciones'> {
  entidad: K;
}

export interface EditarProp<T extends Base, P extends BaseDto, K extends keyof EntidadDatoMapType> extends Omit<GetProp<T>, 'orden'> {
  dto: P;
  id: string;
  entidad: K;
}

export interface EditarElementoProp<T extends Base, P extends BaseDto, K extends keyof EntidadDatoMapType> extends EditarProp<T,P, K> {
  usuario: User;
}

export interface EditarElementoControllerProp<T extends Base, P extends BaseDto, K extends keyof EntidadDatoMapType> extends Omit<EditarElementoProp<T,P, K>, 'qR'>{}

export interface CreateProp<P extends BaseDto, K extends keyof EntidadDatoMapType> extends Pick<GenericoProp, 'qR'> {
  usuario: User;
  dto: P;
  entidad: K;
}
export interface CreateDefaultProp<K extends keyof EntidadDatoMapType, P extends BaseDto> extends Omit<CreateProp<P,K>, 'dto'> {
  entidadError: string;
  defecto: P[];
}


export interface CreateElementoControllerProp<P extends BaseDto, K extends keyof EntidadDatoMapType> extends Omit<CreateProp<P, K>, 'qR'> { }


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
  usuarioId?: string;
}

export interface UpdateRetorno <T extends Base>{
  dato: T,
  isQr?: boolean,
}