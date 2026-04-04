import { Base } from "@src/base/entity/base.entity";
import { LibroPedido } from "@src/libro_pedido/entity/libroPedido.entity";
import { Especificaciones } from "@src/libro_pedido/interface/especificaciones.interface";
import { Column, Entity, ManyToMany } from "typeorm";

@Entity('especificacion')
export class Especificacion extends Base {

  @Column({ type: 'varchar', length: 30 })
  nombre!: Especificaciones;

  @ManyToMany(() => LibroPedido, (libroP) => libroP.especificaciones)
  librosPedidos!: LibroPedido[];

  constructor() {
    super()
  }
}
