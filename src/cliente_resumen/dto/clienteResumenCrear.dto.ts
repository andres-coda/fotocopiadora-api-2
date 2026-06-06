import { Cliente } from "@src/cliente/entity/cliente.entity";
import { BaseDto } from "../../base/dto/baseDto";

export class DtoResumenCrear extends BaseDto {
  cliente!:Cliente
}
