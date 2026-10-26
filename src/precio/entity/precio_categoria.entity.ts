import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Catalogo global de categorias de precio.
 * No extiende Base porque solo tiene id + nombre y no maneja soft-delete.
 */
@Entity('precio_categoria')
export class PrecioCategoria {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 30 })
  nombre!: string;
}
