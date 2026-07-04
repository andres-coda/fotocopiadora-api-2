import { Base } from "../../base/entity/base.entity";
import { Cliente } from "../../cliente/entity/cliente.entity";
import { PedidoItem } from "../../pedido_item/entity/pedido_item.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { EstadoPedido } from "../interface/estadoPedido.enum";

/**
 * Cambios respecto a la versión anterior:
 * - tinyint → integer para estado (BD usa 1-7)
 * - Se eliminó la relación con User (filtrado via RLS)
 * - libroPedidos → pedidoItems (renombre de la relación)
 * - estado lo recalcula automáticamente el trigger fc_actualizar_estado_pedido
 */
@Entity('pedido')
export class Pedido extends Base {
  @Column({ type: 'date', nullable: true, name: 'fecha_entrega' })
  fechaEntrega!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'importe_total' })
  importeTotal!: number;

  @Column({ type: 'int', nullable: true })
  archivos!: number;

  @Column({ type: 'int', nullable: true })
  anillados!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sena!: number;

  @Column({ type: 'int', default: EstadoPedido.PENDIENTE })
  estado!: EstadoPedido;

  @Column({ type: 'uuid', name: 'id_empresa' })
  idEmpresa!: string;

  @ManyToOne(() => Cliente, { nullable: false })
  @JoinColumn({ name: 'id_cliente' })
  cliente!: Cliente;

  @OneToMany(() => PedidoItem, (item) => item.pedido)
  pedidoItems!: PedidoItem[];

  constructor() {
    super();
    this.estado = EstadoPedido.PENDIENTE;
  }
}