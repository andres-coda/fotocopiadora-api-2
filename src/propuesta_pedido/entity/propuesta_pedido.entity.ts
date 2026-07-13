import { Base } from "../../base/entity/base.entity";
import { Libro } from "../../libro/entity/libro.entity";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";

@Entity('propuesta')
export class Propuesta extends Base {

  @Column({type:'varchar', nullable:false, length:50})
  nombre!:string;

  @Column({type:'uuid', nullable:false})
  id_empresa!:string;

  @ManyToMany(() => Libro, libro => libro.propuesta)
  @JoinTable({ name: "propuesta_libro_empresa" })
  libros!: Libro[];

  constructor() {
    super()
  }
}
