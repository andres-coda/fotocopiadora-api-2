import { Base } from "../../base/entity/base.entity";
import { Column, Entity, Index } from "typeorm";

@Entity('materia')
@Index(['nombre', 'user'], { unique: true })
export class Materia extends Base {

  @Column({type:'varchar', length: 50 })
  nombre!: string;

  constructor() {
    super()
  }
}
