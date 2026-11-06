import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('solicitud')
export class Solicitud {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_libro_completo', type: 'uuid' })
  idLibroCompleto!: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @Column({ name: 'fecha_resolucion', type: 'timestamp', nullable: true })
  fechaResolucion!: Date | null;

  @Column({ name: 'id_usuario', type: 'uuid' })
  idUsuario!: string;

  @Column({ type: 'int', default: 1 })
  estado!: number;

  @Column({ name: 'id_empresa', type: 'uuid' })
  idEmpresa!: string;
}