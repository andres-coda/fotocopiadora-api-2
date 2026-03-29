import { Base } from "@src/base/entity/base.entity";
import { Cliente } from "@src/cliente/entity/cliente.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity('pedido')
export class Pedido extends Base {

  @Column({ type: 'date', nullable: true })
  fechaEntrega!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importeTotal!: number;

  @Column({ type: 'varchar', nullable: true })
  archivos!: number;

  @Column({ type: 'varchar', nullable: true })
  anillados!: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sena!: number;

  @ManyToOne(()=> Cliente, cliente => cliente.pedidos)
  cliente!: Cliente;
  
  /* 
  @OneToMany(() => LibroPedido, libroPedido => libroPedido.pedido)
  librosPedidos: LibroPedido[];
 */
  constructor() {
    super()
  }
}
