import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { DtoComponenteRespuesta } from "../../componente/dto/componenteRetorno.dto";
import { Especificaciones } from "../../libro_pedido/interface/especificaciones.interface";
import { DtoMateriaRespuesta } from "../../materia/dto/materiaRetorno.dto";
import { DtoStockRespuesta } from "../../stock/dto/stockRetorno.dto";

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
  materia!: DtoMateriaRespuesta;
  stock!: DtoStockRespuesta;
}