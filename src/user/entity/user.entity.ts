import { Exclude } from "class-transformer";
import { Role } from "../../auth/rol/rol.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

/**
 * Entity mapeada a la tabla `usuario` de PostgreSQL.
 *
 * Diferencias con la versión anterior (MySQL):
 * - Nombre de tabla: user → usuario
 * - Nombre de campo: password → password_hash, role → rol
 * - Se agrega id_empresa (UUID nullable, NULL solo para super_admin)
 * - Se eliminan las relaciones OneToMany (ya no son necesarias,
 *   el RLS de la BD maneja el filtrado por empresa)
 * - No hay FK a otras entidades desde acá
 */

@Entity('usuario')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'varchar', length: 50, name: 'nombre' })
  nombre!: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  password!: string;

  @Exclude()
  @Column({ type: 'varchar', length: 50, name: 'email' })
  email!: string;

  /**
  * Role del usuario. Valores posibles: super_admin | admin | operador.
  * Validado por el constraint ch_tipos_rol en la BD.
  */
  //@Exclude()
  @Column({ type: 'varchar', length: 20, name: 'rol', default: Role.Operador })
  role!: Role;

  /**
   * Empresa a la que pertenece el usuario.
   * NULL únicamente para el super_admin (garantizado por ck_super_admin_empresa).
   */
  @Column({ type: 'uuid', name: 'id_empresa', nullable: true })
  idEmpresa!: string | null;

  constructor() {
    this.deleted = false;
    this.role = Role.Operador;
  }
}