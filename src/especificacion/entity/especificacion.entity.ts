import { Especificaciones } from "../../pedido_item/interface/especificaciones.interface";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('especificacion')
export class Especificacion{
  @PrimaryGeneratedColumn('uuid')
  id!: string;  

  @Column({ type: 'varchar', length: 10 })
  nombre!: Especificaciones;

  @Column({ default: false })
  deleted?: boolean;

  constructor() {
    this.deleted = false;
  }
}
