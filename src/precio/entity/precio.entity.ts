import { Base } from "../../base/entity/base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { PrecioAbareviatura } from "../interface/precio.interface";


@Entity('precio')
export class Precio {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  nombre!: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  descripcion?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  abreviatura?: PrecioAbareviatura;

  constructor() {
  }
}
