import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";

export class DtoClienteRespuesta extends DtoBaseRetorno{
  nombre?: string;
  telefono?: string;
  email?: string;  
}