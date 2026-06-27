import { Base } from "../../base/entity/base.entity";
import { Column, Entity } from "typeorm";


@Entity('precio')
export class Precio extends Base {

  @Column({ type: 'varchar', length: 64 })
  nombre!: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  descripcion?: string;

  constructor() {
    super()
  }
}
