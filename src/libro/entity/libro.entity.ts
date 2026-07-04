import { PedidoItem } from "@src/pedido_item/entity/pedido_item.entity";
import { Especificaciones } from "../../pedido_item/interface/especificaciones.interface";
import { Propuesta } from "../../propuesta_pedido/entity/propuesta_pedido.entity";
import { Stock } from "../../stock/entity/stock.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

@Entity('libro')
export class Libro{
  @PrimaryColumn({ type: 'uuid', name: 'id_libro' })
  idLibro!: string;

  @PrimaryColumn({ type: 'uuid', name: 'id_empresa' })
  idEmpresa!: string;

  @Column({ type: 'boolean', default:false })
  deleted!: boolean;

  @Column({ type: 'int' })
  cantidadPg!: number;

  @Column({ type: 'int', nullable:true, name: 'cantidad_adhesivo' })
  adhesivo?: number;

  @Column({ type: 'jsonb', nullable: true })
  especificacionesDefecto?: Especificaciones[];

  /* @OneToOne(() => Stock, stock => stock.libro)
  stock!: Stock; */

  @OneToMany(() => PedidoItem, pedidoItem => pedidoItem.libro)
  pedidoItems!: PedidoItem[];

  @ManyToMany(() => Propuesta, propuesta => propuesta.libro)
  propuesta!: Propuesta[];

  constructor() {
    this.deleted = false;
  }
}
