import { Base } from "@src/base/entity/base.entity";
import { Libro } from "@src/libro/entity/libro.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity('materia')
export class Materia extends Base {

  @Column({type:'varchar', length: 128 })
  nombre!: string;

  @OneToMany(() => Libro, libro => libro.materia)
  libros!: Libro[];

  constructor() {
    super()
  }
}
