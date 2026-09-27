import { GetPedidoItemBusqueda } from "@src/pedido_item/interface/pedido_item_busqueda.interface";
import { DtoLibroEmpresaRespuesta, DtoLibroNombreRespuesta, DtoLibroRespuesta, ResumenLibro } from "../dto/libroRetorno.dto";
import { Libro } from "../entity/libro.entity";
import { RetornoLibroNombreProp, RetornoVistaLibroProp } from "../interface/libro.interface";
import { toRespuestaMateria } from "@src/materia/util/toRespuestaMateria";
import { LibroRetorno } from "../retorno/libro.retorno";

export const toRespuestaLibroEmptresXlibro = (libro: Libro) => {
  const newLibro = new LibroRetorno({...libro, id:libro.id_libro});
  newLibro.armarLibroSimple({...libro});
  return newLibro;
}

export const toRespuestaLibroEmpresa = (dato?: RetornoVistaLibroProp): DtoLibroEmpresaRespuesta | undefined => {
  if (!dato) return undefined;
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

export const toRespuestaLibroNombre = (dato?: RetornoLibroNombreProp): LibroRetorno | undefined => {
  if (!dato) return undefined;
  const libro = new LibroRetorno({...dato});
  libro.agregarMateriaLibroRetorno({...dato});
  return libro;
}

export const toRespuestaLibro = (dato?: RetornoVistaLibroProp): LibroRetorno | undefined => {
  if(!dato) return undefined;
  const libro = new LibroRetorno({...dato});
  libro.armarLibroCompletoRetorno({...dato, componentes:[], componentes_texto: dato.componentes ?? ''});

  return libro;
}

