import { Base } from "@src/base/entity/base.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { Libro } from "@src/libro/entity/libro.entity";
import { Pedido } from "@src/pedido/entity/pedido.entity";
import { Especificacion } from "@src/especificacion/entity/especificacion.entity";
import { Estado } from "@src/interface/estado.interface";

@Entity('libro_pedido')
export class LibroPedido extends Base {
  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  detalles?: string;

  @Column({type:'varchar', length: 20, nullable:false})
  estado!:Estado;

  @ManyToOne(() => Libro, libro => libro.libroPedidos, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  libro!: Libro;

  @ManyToOne(() => Pedido, pedido => pedido.libroPedidos, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  pedido!: Pedido;

  @ManyToMany(() => Especificacion, (esp) => esp.librosPedidos)
  @JoinTable({ name: "libro-pedido-especificaciones" })
  especificaciones!: Especificacion[];

  constructor() {
    super()
    this.estado = Estado.PENDIENTE
  }
}