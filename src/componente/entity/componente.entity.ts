import { Base } from "../../base/entity/base.entity";
import { Libro } from "../../libro/entity/libro.entity";
import { Column, Entity, Index, ManyToMany, OneToMany } from "typeorm";

@Entity('componente')
@Index(['nombre', 'user'], { unique: true })
export class Componente extends Base {

  @Column({ type: 'varchar', length: 30 })
  nombre!: string;

  @ManyToMany(() => Libro, (libro) => libro.componentes)
  libros!: Libro[];

  constructor() {
    super()
  }
}
