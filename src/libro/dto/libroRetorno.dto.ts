import { DtoBaseRetorno } from "@src/base/dto/baseRetorno.dto";
import { DtoComponenteRespuesta } from "@src/componente/dto/componenteRetorno.dto";
import { Especificaciones } from "@src/libro_pedido/interface/especificaciones.interface";

export class DtoLibroRespuesta extends DtoBaseRetorno {
  nombre!: string;
  descripcion?: string;
  editorial?: string;
  edicion?: number;
  nivel?: string;
  cantidadPg!: number;
  anio?: string;
  adhesivos?: number;
  autor?: string;
  img?: string;
  especificacionesDefecto?: Especificaciones[];
  componentes!: DtoComponenteRespuesta[]; 
}