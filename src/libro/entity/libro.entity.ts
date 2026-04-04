import { Base } from "@src/base/entity/base.entity";
import { LibroPedido } from "@src/libro_pedido/entity/libroPedido.entity";
import { Materia } from "@src/materia/entity/materia.entity";
import { Stock } from "@src/stock/entity/stock.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from "typeorm";

@Entity('libro')
export class Libro extends Base {

  @Column({ type: 'varchar', length: 255 })
  nombre!: string;

  @Column({ type: 'varchar', length: 255})
  descripcion?: string;

  @Column({ type: 'varchar', length: 64 })
  editorial?: string;

  @Column({ type: 'int', length: 5})
  cantidadPg!: number;

  @Column({ type: 'varchar', length: 4, nullable:true})
  anio?: string;

  @Column({ type: 'int', length: 2, nullable:true})
  adhesivo?: number;

  @Column({ type: 'varchar', nullable: true, length:32 })
  autor?: string;

  @Column({ type: 'varchar', length:128})
  img?: string;

  @ManyToOne(() => Materia, materia => materia.libros)
  materia!: Materia;

  @OneToOne(()=> Stock, stock => stock.libro)
  stock!: Stock;

  @OneToMany(() => LibroPedido, libroPedido => libroPedido.libro)
  libroPedidos!: LibroPedido[];

  constructor() {
    super();
  }
}
