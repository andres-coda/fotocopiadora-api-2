import { DtoLibroRespuesta } from "@src/libro/dto/libroRetorno.dto";
import { DtoPropuestaRespuesta } from "../dto/propuestaRetorno.dto";
import { toRespuestaLibro } from "@src/libro/utils/toRespuestaLibro";
import { PropuestaVistaProp } from "../interface/propuesta.interface";
import { PropuestaRetorno } from "../retorno/propuesta.retorno";

export const toRespuestaLibroPropuesta = (dato: PropuestaVistaProp): DtoLibroRespuesta => {
  return {
    id: dato.id_libro,
    deleted: dato.deleted,
    especificacionesDefecto: dato.especificaciones_defecto,
    adhesivos: dato.cantidad_adhesivo,
    cantidadPg: dato.cantidad_pg,
    detalleImpresion: dato.detalle_impresion,
    nombre: dato.nombre,
    descripcion: dato.descripcion,
    editorial: dato.editorial,
    edicion: dato.edicion,
    nivel: dato.nivel,
    anio: dato.anio,
    autor: dato.autor,
    img: dato.img,
    componentes_texto: dato.componentes,
    materia: {
      id: dato.id_materia,
      nombre: dato.materia
    }
  }
}

export const toRespuestaPropuesta = (
  datos: PropuestaVistaProp[],
): PropuestaRetorno[] => {
  const propuestas = new Map<string, PropuestaRetorno>();

  for (const dato of datos) {
    let propuesta = propuestas.get(dato.id_propuesta);

    if (!propuesta) {
      propuesta = new PropuestaRetorno({ ...dato, id: dato.id_propuesta, deleted: dato.deleted_propuesta });
      propuestas.set(dato.id_propuesta, propuesta);
    }
    propuesta.agregarLibroApropuestaRetorno({ ...dato, id: dato.id_libro });

  }

  return [...propuestas.values()];
};