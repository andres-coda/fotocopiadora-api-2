import { ClienteResumen } from "../entity/clienteResumen.entity";

export class DtoResumenClienteRespuesta{
  pendiente!: number;
  listo!: number;
  retirado!: number; 
  cancelado!: number; 
}


export const clienteResumenRespuesta = (entidad?:ClienteResumen): DtoResumenClienteRespuesta | undefined => {
  if(!entidad) return undefined;
  const resumen:DtoResumenClienteRespuesta = {
      pendiente: entidad.pendiente,
      listo: entidad.listo,
      retirado: entidad.retirado,
      cancelado: entidad.cancelado,
    }
  return resumen;
}