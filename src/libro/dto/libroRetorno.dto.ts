import { DtoPropuestaLibroRetorno } from "@src/propuesta_pedido/dto/propuestaRetorno.dto";
import { DtoBaseRetorno } from "../../base/dto/baseRetorno.dto";
import { DtoComponenteRespuesta } from "../../componente/dto/componenteRetorno.dto";
import { Especificaciones } from "../../pedido_item/interface/especificaciones.interface";
import { DtoMateriaRespuesta } from "../../materia/dto/materiaRetorno.dto";

interface Resumen {
  listo: number,
  pendiente: number,
  retirado: number,
  cancelado: number,
  stock?: number,
}

export class DtoLibroEmpresaRespuesta extends DtoBaseRetorno {
  especificacionesDefecto?: Especificaciones[];
  adhesivos?: number;
  cantidadPg!: number;
  detalleImpresion?:string;
}

export class DtoLibroRespuesta extends DtoLibroEmpresaRespuesta {
  nombre!: string;
  editorial?: string;
  edicion?: number;
  nivel?: string;
  anio?: string;
  autor?: string;
  img?: string;
  componentes?: DtoComponenteRespuesta[];
  materia?: DtoMateriaRespuesta;
  propuesta?: DtoPropuestaLibroRetorno[];
  componentes_texto?: string;
  resumen?: Resumen;
  descripcion?: string;
}




