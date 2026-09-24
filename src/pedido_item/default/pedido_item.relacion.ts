export const PEDIDO_ITEM_RELACION = ['pedido'];

export const PEDIDO_ITEM_SELECT = {
  idPedido: true,
  id:true,
  libro_id:true,
  sede_id:true,
  fechaCreacion:true,
  fechaActualizacion:true,
  deleted:true,
  cantidad:true,
  detalles:true,
  estado:true,
  pedido: {
    estado:true,
    idCliente:true
  }
}