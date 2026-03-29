import { Base } from "@src/base/entity/base.entity";
import { Column, Entity } from "typeorm";

@Entity('precio')
export class Precio extends Base {

  @Column({type: 'varchar', length: 64})
  tipo!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importe!: number;

  constructor() {
    super()
  }
}
