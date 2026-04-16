import { Base } from "../../base/entity/base.entity";
import { Libro } from "../../libro/entity/libro.entity";
import { Column, Entity, ManyToMany, OneToMany } from "typeorm";

@Entity('componente')
export class Componente extends Base {

  @Column({ type: 'varchar', length: 30 })
  nombre!: string;

  @ManyToMany(() => Libro, (libro) => libro.componentes)
  libros!: Libro[];

  constructor() {
    super()
  }
}
