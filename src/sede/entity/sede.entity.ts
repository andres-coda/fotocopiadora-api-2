import { Base } from "@src/base/entity/base.entity";
import { LibroPedido } from "@src/libro_pedido/entity/libroPedido.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity('sede')
export class Sede extends Base {

  @Column({ type: 'varchar', length: 64 })
  nombre!: string;

  @OneToMany(() => LibroPedido, libroPedido => libroPedido.sede)
  libroPedidos!: LibroPedido[];

  constructor() {
    super()
  }
}
