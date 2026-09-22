import { Base } from "../../base/entity/base.entity";
import { Column, Entity } from "typeorm";

@Entity('editorial')
export class Editorial extends Base {

  @Column({ type: 'varchar', length: 255 })
  nombre!: string;

  constructor() {
    super()
  }
}
