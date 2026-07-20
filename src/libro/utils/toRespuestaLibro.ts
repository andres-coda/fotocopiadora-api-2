import { DtoLibroEmpresaRespuesta, DtoLibroNombreRespuesta, DtoLibroRespuesta } from "../dto/libroRetorno.dto";
import { Libro } from "../entity/libro.entity";
import { RetornoLibroNombreProp, RetornoVistaLibroProp } from "../interface/libro.interface";

export const toRespuestaLibroEmptresXlibro = (libro:Libro) =>{
  return {
    id: libro.id_libro,
    deleted: libro.deleted,
    cantidadPg: libro.cantidad_pg,
    adhesivos: libro.cantidad_adhesivo,
    especificacionesDefecto: libro.especificaciones_defecto,
    //detalles: libro.descripcion   
  }
}

export const toRespuestaLibroEmpresa = (dato?:RetornoVistaLibroProp):DtoLibroEmpresaRespuesta | undefined =>{
  if(!dato) return undefined;
  return {
    id: dato.id,
    deleted: false,
    cantidadPg: dato.cantidad_pg,
    adhesivos: dato.cantidad_adhesivo,
    especificacionesDefecto: dato.especificaciones_defecto,
    detalleImpresion: dato.detalle_impresion,
    id_empresa: dato.id_empresa,    
  }
}

export const toRespuestaLibroNombre = (dato?:RetornoLibroNombreProp): DtoLibroNombreRespuesta | undefined => {
  if(!dato ) return undefined;
  
  return {
    id: dato.id,
    nombre: dato.nombre,
    materia: {
      nombre: dato.materia,
      deleted: false,
      id: dato.id_materia
    },
    editorial: dato.editorial,
  }
}

export const toRespuestaLibro = (dato?: RetornoVistaLibroProp): DtoLibroRespuesta | undefined => {
  const libroEmpresa: DtoLibroEmpresaRespuesta | undefined = toRespuestaLibroEmpresa(dato);
  
  if(!dato || !libroEmpresa) return undefined;

  const libro: DtoLibroRespuesta = {
    ...libroEmpresa,
    nombre: dato.nombre,
    descripcion: dato.descripcion,
    edicion: dato.edicion,
    autor: dato.autor,
    anio: dato.anio,
    img: dato.img,
    nivel: dato.nivel,
    componentes_texto: dato.componentes,
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
      retirado: dato.retirado,
      stock: dato.stock
    },
  }
  return libro;
}

