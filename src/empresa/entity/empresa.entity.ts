import { Base } from '../../base/entity/base.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('empresa')
export class Empresa extends Base{
  @Column({ type: 'varchar', length: 50})
  nombre!: string;

  @Column({ type: 'varchar', length: 15})
  telefono!: string;

  @Column({ type: 'varchar', length:50 })
  email!: string;
}
