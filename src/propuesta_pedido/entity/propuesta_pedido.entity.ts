import { Base } from "../../base/entity/base.entity";
import { Libro } from "../../libro/entity/libro.entity";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";

@Entity('propuesta')
export class Propuesta extends Base {

  @Column({type:'varchar', nullable:false, length:100})
  nombre!:string;

  @ManyToMany(() => Libro, libro => libro.propuesta)
  @JoinTable({ name: "propuesta_libro" })
  libro!: Libro[];

  constructor() {
    super()
  }
}
