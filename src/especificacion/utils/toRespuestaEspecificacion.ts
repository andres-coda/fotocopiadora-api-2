import { Especificaciones } from "@src/pedido_item/interface/especificaciones.interface";
import { Especificacion } from "../entity/especificacion.entity";

export const toRespuestaEspecificacion = (dato?: Especificacion): Especificaciones | undefined => {
  if (!dato) return undefined;
  return dato.nombre;
}