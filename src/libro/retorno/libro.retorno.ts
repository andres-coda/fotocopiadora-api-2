import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";
import { ComponenteRetorno, ComponenteRetornoProp } from "@src/componente/retorno/componente.retorno";
import { MateriaRetorno, MateriaRetornoProp } from "@src/materia/retorno/materia.retorno";
import { Especificaciones } from "@src/pedido_item/interface/especificaciones.interface";
import { ResumenRetorno, ResumenRetornoProp } from "@src/retorno/resumen.retorno";

export interface LibroRetornoProp extends BaseRetornoProp {
  nombre?: string;
  editorial?: string;
}

interface LibroMinimoSinMateriaRetornoProp extends Pick<ResumenRetornoProp, 'pendiente' | 'listo' | 'retirado' | 'cancelado' | 'stock'> {
  edicion?: number;
  anio?: string;
  componentes?: ComponenteRetornoProp[];
  nivel?: string;
}

export interface LibroMinimoRetornoProp extends LibroMinimoSinMateriaRetornoProp {
  materia?: string;
  id_materia?: string;
}
interface LibroSimpleRetornoProp {
  autor?: string;
  img?: string;
  cantidad_pg?: number;
  cantidad_adhesivo?: number;
  especificaciones_defecto?: Especificaciones[];
  detalle_impresion?: string;
}

interface LibroCompletoRetornoProp extends LibroMinimoRetornoProp, LibroSimpleRetornoProp {
  componentes_texto?: string;
}

export interface LibroVistaPropuestaRetornoProp {
  id_materia: string;
  descripcion: string;
  edicion?: number;
  autor: string;
  anio?: string;
  img: string;
  nivel?: string;
  componentes?: string;
  cantidad_pg: number;
  cantidad_adhesivo: number;
  especificaciones_defecto: Especificaciones[];
  materia: string;
  detalle_impresion: string;
  deleted: boolean;
}

export class LibroRetorno extends BaseRetorno {
  nombre?: string;
  editorial?: string;
  materia?: MateriaRetorno;

  resumen?: ResumenRetornoProp;
  edicion?: number;
  anio?: string;
  componentes!: ComponenteRetornoProp[];
  nivel?: string;

  autor?: string;
  img?: string;
  cantidadPg?: number;
  adhesivos?: number;
  especificacionesDefecto?: Especificaciones[];
  detalleImpresion?: string;
  componentes_texto?: string;

  constructor({ id, fecha_actualizacion, fecha_creacion, deleted, nombre, editorial }: LibroRetornoProp) {
    super({ id, fecha_actualizacion, fecha_creacion, deleted })
    this.nombre = nombre;
    this.editorial = editorial;
    this.componentes = [];
  }

  public agregarMateriaLibroRetorno({ id, fecha_actualizacion, fecha_creacion, deleted, nombre }: MateriaRetornoProp) {
    const materia = new MateriaRetorno({
      id, fecha_actualizacion, fecha_creacion, deleted, nombre
    })

    this.materia = materia;
  }

  public agregarResumenLibroRetorno({
    pendiente, listo, retirado, cancelado, stock
  }: LibroMinimoSinMateriaRetornoProp) {
    const resumen = new ResumenRetorno({ id: this.id, pendiente, listo, retirado, cancelado, stock })
    this.resumen = resumen;
  }

  private agregarMinimoLibroRetorno({
    edicion, anio, componentes, nivel, pendiente, listo, retirado, cancelado, stock
  }: LibroMinimoSinMateriaRetornoProp) {
    this.agregarResumenLibroRetorno({ pendiente, listo, retirado, cancelado, stock });
    const newComponentes = [];
    if (componentes && componentes?.length > 0) {
      for (const comp of componentes) {
        const newComponente = new ComponenteRetorno({
          id: comp.id,
          nombre: comp.nombre
        });
        newComponentes.push(newComponente);
      }
    }

    this.edicion = edicion;
    this.anio = anio;
    this.nivel = nivel;
    this.componentes = newComponentes;
  }

  public armarLibroCompletoRetorno({
    autor, img, cantidad_pg, cantidad_adhesivo, especificaciones_defecto, detalle_impresion,
    edicion, anio, componentes, nivel, pendiente, listo, retirado, cancelado, stock, componentes_texto
  }: LibroCompletoRetornoProp) {
    this.armarLibroSimple({ autor, img, cantidad_pg, cantidad_adhesivo, especificaciones_defecto, detalle_impresion });
    this.armarLibroMinimo({ edicion, anio, componentes, nivel, pendiente, listo, retirado, cancelado, stock });
    this.componentes_texto = componentes_texto;
  }

  public armarLibroSimple({ autor, img, cantidad_pg, cantidad_adhesivo, especificaciones_defecto, detalle_impresion }: LibroSimpleRetornoProp) {
    this.autor = autor;
    this.img = img;
    this.cantidadPg = cantidad_pg;
    this.adhesivos = cantidad_adhesivo;
    this.especificacionesDefecto = especificaciones_defecto;
    this.detalleImpresion = detalle_impresion;

  }

  public armarLibroMinimo({
    edicion, anio, componentes, nivel, pendiente, listo, retirado, cancelado, stock,
    materia, id_materia
  }: LibroMinimoRetornoProp) {
    if (id_materia && materia) {
      this.agregarMateriaLibroRetorno({ id: id_materia, nombre: materia })
    }
    this.agregarMinimoLibroRetorno({
      edicion, anio, componentes, nivel, pendiente, listo, retirado, cancelado, stock
    })
  }

  public armarLibroPropuesta({
    id_materia, descripcion, edicion, autor, anio, img, nivel, componentes, cantidad_pg, cantidad_adhesivo, especificaciones_defecto,
    materia, detalle_impresion
  }: LibroVistaPropuestaRetornoProp) {
    this.agregarMateriaLibroRetorno({ id: id_materia, nombre: materia });
    this.armarLibroSimple({ autor, img, cantidad_pg, cantidad_adhesivo, especificaciones_defecto, detalle_impresion: detalle_impresion || descripcion });
    if(nivel) this.nivel = nivel;
    if(componentes) this.componentes_texto = componentes;
    if(edicion) this.edicion = edicion;
    if(anio) this.anio = anio;
  }
}