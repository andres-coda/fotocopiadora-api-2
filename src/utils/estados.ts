import { Estado } from "../interface/estado.interface";

export const estadosPendientes = new Set([
  Estado.PENDIENTE,
  Estado.IMPRESO_MITAD,
  Estado.IMPRESO_COMPLETO
]);

export const estadosRetirados = new Set([
  Estado.RETIRADO,
  Estado.CANCELADO,
]);