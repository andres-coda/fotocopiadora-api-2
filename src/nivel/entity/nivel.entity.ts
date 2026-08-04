import { Base } from "../../base/entity/base.entity";
import { Column, Entity } from "typeorm";

@Entity('nivel')
export class Nivel extends Base {

  @Column({ type: 'varchar', length: 30 })
  nombre!: string;

  constructor() {
    super()
  }
}
