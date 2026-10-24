import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Tabla mensaje — mensajes configurables por empresa.
 *
 * No extiende Base porque la tabla mensaje no tiene:
 * - fecha_creacion / fecha_actualizacion
 * - deleted (el borrado es fisico)
 * El filtrado por empresa lo hace el RLS de PostgreSQL automaticamente.
 */
@Entity('mensaje')
export class Mensaje {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * id_empresa no se mapea como FK TypeORM porque el RLS
   * de PostgreSQL lo maneja automaticamente. Se incluye como
   * columna simple para poder setearlo al crear, ya que la tabla
   * no tiene DEFAULT para esta columna.
   */
  @Column({ type: 'uuid', name: 'id_empresa' })
  idEmpresa!: string;

  @Column({ type: 'varchar', length: 50, name: 'nombre' })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  mensaje?: string;
}
