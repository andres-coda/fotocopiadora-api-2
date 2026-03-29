import { Base } from "@src/base/entity/base.entity";
import { Column, Entity } from "typeorm";

@Entity('sede')
export class Sede extends Base {

  @Column({type: 'varchar', length: 64})
  nombre!: string;

  constructor() {
    super()
  }
}
