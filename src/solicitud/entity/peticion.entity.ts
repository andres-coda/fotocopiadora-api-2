import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('peticion')
export class Peticion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_solicitud', type: 'uuid' })
  idSolicitud!: string;

  @Column({ type: 'varchar', length: 20 })
  campo!: string;

  @Column({ name: 'valor_anterior', type: 'varchar', nullable: true })
  valorAnterior!: string | null;

  @Column({ name: 'valor_nuevo', type: 'varchar', nullable: true })
  valorNuevo!: string | null;

  @Column({ type: 'varchar', nullable: true })
  observaciones!: string | null;

  @Column({ type: 'int', default: 1 })
  estado!: number;
}