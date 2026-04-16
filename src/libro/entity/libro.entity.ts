import { Base } from "../../base/entity/base.entity";
import { Componente } from "../../componente/entity/componente.entity";
import { LibroPedido } from "../../libro_pedido/entity/libroPedido.entity";
import { Especificaciones } from "../../libro_pedido/interface/especificaciones.interface";
import { Materia } from "../../materia/entity/materia.entity";
import { Propuesta } from "../../propuesta_pedido/entity/propuesta_pedido.entity";
import { Stock } from "../../stock/entity/stock.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from "typeorm";

@Entity('libro')
export class Libro extends Base {

  @Column({ type: 'varchar', length: 255 })
  nombre!: string;

  @Column({ type: 'varchar', length: 255 })
  descripcion?: string;

  @Column({ type: 'varchar', length: 64 })
  editorial?: string;

  @Column({ type: 'int' })
  edicion?: number;

  @Column({ type: 'varchar', length: 30 })
  nivel?: string;

  @Column({ type: 'int' })
  cantidadPg!: number;

  @Column({ type: 'varchar', length: 4, nullable: true })
  anio?: string;

  @Column({ type: 'int', nullable: true })
  adhesivo?: number;

  @Column({ type: 'varchar', nullable: true, length: 32 })
  autor?: string;

  @Column({ type: 'varchar', length: 128 })
  img?: string;

  @Column({ type: 'json', nullable: true })
  especificacionesDefecto?: Especificaciones[];

  @ManyToOne(() => Materia, materia => materia.libros)
  materia!: Materia;

  @OneToOne(() => Stock, stock => stock.libro)
  stock!: Stock;

  @OneToMany(() => LibroPedido, libroPedido => libroPedido.libro)
  libroPedidos!: LibroPedido[];

  @ManyToMany(() => Propuesta, propuesta => propuesta.libro)
  propuesta!: Propuesta[];

  @ManyToMany(() => Componente, (componente) => componente.libros, {nullable: true})
  @JoinTable({ name: "libros-componentes" })
  componentes!: Componente[];

  constructor() {
    super();
  }
}
