import { UserRetornoProp } from "../../interface/userRetorno.interface";

export class DtoBaseRetorno {
  id!: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  deleted!: boolean;
}