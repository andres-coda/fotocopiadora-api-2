import { DtoLibroRespuesta } from "@src/libro/dto/libroRetorno.dto";
import { DtoPropuestaRespuesta } from "../dto/propuestaRetorno.dto";
import { toRespuestaLibro } from "@src/libro/utils/toRespuestaLibro";
import { PropuestaVistaProp } from "../interface/propuesta.interface";

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
): DtoPropuestaRespuesta[] => {
  const propuestas = new Map<string, DtoPropuestaRespuesta>();

  for (const dato of datos) {
    let propuesta = propuestas.get(dato.id_propuesta);

    if (!propuesta) {
      propuesta = {
        id: dato.id_propuesta,
        nombre: dato.nombre_propuesta,
        fechaActualizacion: dato.fecha_actualizacion,
        fechaCreacion: dato.fecha_creacion,
        deleted: dato.deleted_propuesta,
        libros: [],
      };

      propuestas.set(dato.id_propuesta, propuesta);
    }

    propuesta.libros.push(toRespuestaLibroPropuesta(dato));
  }

  return [...propuestas.values()];
};