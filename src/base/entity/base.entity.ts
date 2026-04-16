import { Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import * as path from 'path';
import { User } from "../../user/entity/user.entity";

export abstract class Base {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  fechaCreacion!: Date;

  @UpdateDateColumn()
  fechaActualizacion!: Date;

  @Column()
  deleted: boolean;

  @ManyToOne(() => require('../../user/entity/user.entity').User)
  user!: User;

  constructor() {
    this.deleted = false;
  }
}