import { Base } from "../../base/entity/base.entity";
import { Especificaciones } from "../../pedido_item/interface/especificaciones.interface";
import { Column, Entity } from "typeorm";

@Entity('especificacion')
export class Especificacion extends Base {

  @Column({ type: 'varchar', length: 30 })
  nombre!: Especificaciones;

  constructor() {
    super()
  }
}
