import { Role } from "@src/auth/rol/rol.enum";
import { Base } from "@src/base/entity/base.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity('user')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  fechaCreacion!: Date;

  @UpdateDateColumn()
  fechaActualizacion!: Date;

  @Column()
  deleted: boolean;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @OneToMany(() => Base, base => base.user, { cascade: true })
  base!: Base[];

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role!: string;

  constructor() {
    this.deleted = false;
  }
}