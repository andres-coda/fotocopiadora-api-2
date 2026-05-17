import { Especificaciones } from "../../libro_pedido/interface/especificaciones.interface";
import { Base } from "../../base/entity/base.entity";
import { Column, Entity } from "typeorm";
import { PrecioAbareviatura } from "../interface/precio.interface";


@Entity('precio')
export class Precio extends Base {

  @Column({type: 'varchar', length: 64})
  nombre!: string;

  @Column({type: 'varchar', length: 20, nullable:true})
  abreviatura?: PrecioAbareviatura[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importe!: number;

  constructor() {
    super()
  }
}
