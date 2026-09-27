import { BaseRetorno, BaseRetornoProp } from "@src/base/retorno/base.retorno";
import { ResumenRetorno, ResumenRetornoProp } from "@src/retorno/resumen.retorno";


export interface ClienteRetornoProp extends BaseRetornoProp {
  nombre?: string;
  telefono?: string;
  email?: string;
}

interface ClienteResumenRetornoProp extends Pick<ResumenRetornoProp, 'pendiente' | 'listo' | 'retirado' | 'cancelado'>{}

export class ClienteRetorno extends BaseRetorno {
  nombre?: string;
  telefono?: string;
  email?: string;
  resumen?:ResumenRetorno;


  constructor({ id, fecha_actualizacion, fecha_creacion, deleted, nombre, telefono, email }: ClienteRetornoProp) {
    super({ id, fecha_actualizacion, fecha_creacion, deleted })
    this.nombre = nombre;
    this.telefono = telefono;
    this.email = email;
  }

  public agregarResumenCliente({ pendiente, listo, retirado, cancelado}:ClienteResumenRetornoProp) {
    const resumen = new ResumenRetorno({
      id: this.id, pendiente, listo, retirado, cancelado
    });

    this.resumen = resumen;
  }
}