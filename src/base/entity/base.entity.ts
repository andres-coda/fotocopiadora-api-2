import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * Clase base para todas las entidades del sistema.
 *
 * Cambios respecto a la versión anterior (MySQL):
 * - Se eliminó la relación ManyToOne a User.
 *   El filtrado por empresa/usuario lo realiza el Row-Level Security
 *   de PostgreSQL automáticamente usando los GUCs de sesión
 *   (app.user_id, app.empresa_id) inyectados por DbContextInterceptor.
 *
 * - Los nombres de columna siguen la convención snake_case de la BD
 *   mediante el parámetro `name` de cada decorador.
 */

export abstract class Base {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion?: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion?: Date;

  @Column({ default: false })
  deleted?: boolean;

  constructor() {
    this.deleted = false;
  }
}