import { Base } from "../../base/entity/base.entity";
import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { Libro } from "../../libro/entity/libro.entity";
import { Pedido } from "../../pedido/entity/pedido.entity";
import { Especificacion } from "../../especificacion/entity/especificacion.entity";
import { Estado } from "../../interface/estado.interface";
import { Sede } from "../../sede/entity/sede.entity";

@Entity('libro_pedido')
export class LibroPedido extends Base {
  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  detalles?: string;

  @Column({ type: 'tinyint' })
  estado!: Estado;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  libroId!: string;

  @ManyToOne(() => Libro, libro => libro.libroPedidos, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  libro!: Libro;

  @ManyToOne(() => Sede, sede => sede.libroPedidos, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  sede!: Sede;

  @Index()
  @Column({ name: 'pedidoId', type: 'varchar', length: 36 })
  pedidoId!: string;

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