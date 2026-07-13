import { PedidoItem } from "@src/pedido_item/entity/pedido_item.entity";
import { Especificaciones } from "../../pedido_item/interface/especificaciones.interface";
import { Propuesta } from "../../propuesta_pedido/entity/propuesta_pedido.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";

@Entity('libro_empresa')
export class Libro {
  @PrimaryColumn({ type: 'uuid', name: 'id_libro' })
  id_libro!: string;

  @PrimaryColumn({ type: 'uuid', name: 'id_empresa' })
  id_empresa!: string;

  @Column({ type: 'boolean', default: false })
  deleted!: boolean;

  @Column({ type: 'int', name: 'cantidad_pg' })
  cantidad_pg!: number;

  @Column({ type: 'int', nullable: true, name: 'cantidad_adhesivo' })
  cantidad_adhesivo?: number;

  @Column({ type: 'jsonb', nullable: true, name:'especificaciones_defecto' })
  especificaciones_defecto?: Especificaciones[];

  @OneToMany(() => PedidoItem, pedidoItem => pedidoItem.libro)
  pedidoItems!: PedidoItem[];

  @ManyToMany(() => Propuesta, propuesta => propuesta.libros)
  @JoinTable({ name: "propuesta_libro_empresa" })
  propuesta!: Propuesta[];

  constructor() {
    this.deleted = false;
  }
}
