import { Base } from "../../base/entity/base.entity";
import { Column, Entity, Index } from "typeorm";

@Entity('componente')
@Index(['nombre', 'user'], { unique: true })
export class Componente extends Base {

  @Column({ type: 'varchar', length: 30 })
  nombre!: string;

  constructor() {
    super()
  }
}
