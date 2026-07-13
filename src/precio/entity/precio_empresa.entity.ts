import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Precio } from './precio.entity';

/**
 * Tabla precio_empresa — precios configurados por cada empresa.
 * 
 * No extiende Base porque:
 * - PK compuesta (id_empresa + id_precio), no UUID simple
 * - No tiene soft-delete propio (se elimina físicamente)
 * - El filtrado por empresa lo hace el RLS automáticamente
 */
@Entity('precio_empresa')
export class PrecioEmpresa {
  @PrimaryColumn({ type: 'uuid', name: 'id_empresa' })
  id_empresa!: string;

  @PrimaryColumn({ type: 'uuid', name: 'id_precio' })
  id_precio!: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion?: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion?: Date;

  @Column({ default: false })
  deleted?: boolean;


  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'importe' })
  importe!: number;

  @Column({ type: 'varchar', length: 250, nullable: true, name: 'detalles' })
  detalles?: string;

  /**
   * Relación al catálogo global de precios.
   * Cargando esto obtenemos nombre + descripcion del precio.
   */
  @ManyToOne(() => Precio, { eager: false })
  @JoinColumn({ name: 'id_precio' })
  precio!: Precio;
}
