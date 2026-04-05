import { Base } from "@src/base/entity/base.entity";
import { ClienteResumen } from "@src/cliente_resumen/entity/clienteResumen.entity";
import { Pedido } from "@src/pedido/entity/pedido.entity";
import { Column, Entity, OneToMany, OneToOne, Unique } from "typeorm";

@Entity('cliente')
export class Cliente extends Base {

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre?: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  telefono?: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email?: string;

  @OneToMany(() => Pedido, pedido => pedido.cliente)
  pedidos!: Pedido[];

  @OneToOne(() => ClienteResumen, cl => cl.cliente)
  resumen!: ClienteResumen;

  constructor() {
    super()
  }
}
