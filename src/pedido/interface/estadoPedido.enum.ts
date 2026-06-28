/**
 * Estados de pedido y pedido_item en la nueva BD.
 * Coinciden con el constraint ch_estado de PostgreSQL (1-7).
 * Reemplaza el enum anterior (tinyint con valores distintos).
 */
export enum EstadoPedido {
  PENDIENTE = 1,
  IMPRIMIENDO = 2,
  IMPRESO = 3,
  LISTO = 4,
  RETIRADO = 5,
  CANCELADO = 6,
}