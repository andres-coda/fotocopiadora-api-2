import { DtoLibroRespuesta } from "../dto/libroRetorno.dto";
import { RetornoVistaLibroProp } from "../interface/libro.interface";

export const toRespuestaLibro = (dato?: RetornoVistaLibroProp): DtoLibroRespuesta | undefined => {
  if(!dato) return undefined;

  const libro: DtoLibroRespuesta = {
    id: dato.id,
    deleted: false,
    nombre: dato.nombre,
    descripcion: dato.descripcion,
    edicion: dato.edicion,
    autor: dato.autor,
    anio: dato.anio,
    img: dato.img,
    nivel: dato.nivel,
    componentes_texto: dato.componentes,
    cantidadPg: dato.cantidad_pg,
    adhesivos: dato.cantidad_adhesivo,
    especificacionesDefecto: dato.especificaciones_defecto,
    materia: {
      nombre: dato.materia,
      deleted: false,
      id: dato.id_materia
    },
    editorial: dato.editorial,
    resumen: {
      listo: dato.listo,
      pendiente: dato.pendiente,
      cancelado: dato.cancelado,
      retirado: dato.retirado
    },
  }
  return libro;
}

