import { Base } from "../../base/entity/base.entity";
import { Cliente } from "../../cliente/entity/cliente.entity";
import { LibroPedido } from "../../libro_pedido/entity/libroPedido.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity('pedido')
export class Pedido extends Base {

  @Column({ type: 'date', nullable: true })
  fechaEntrega!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importeTotal!: number;

  @Column({ type: 'int', nullable: true })
  archivos!: number;

  @Column({ type: 'int', nullable: true })
  anillados!: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sena!: number;

  @ManyToOne(() => Cliente, cliente => cliente.pedidos)
  cliente!: Cliente;

  @OneToMany(() => LibroPedido, libroPedido => libroPedido.pedido)
  libroPedidos!: LibroPedido[];

  constructor() {
    super()
  }
}
