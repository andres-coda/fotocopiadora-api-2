import { Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import * as path from 'path';
import { User } from "@src/user/entity/user.entity";

export abstract class Base {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  fechaCreacion!: Date;

  @UpdateDateColumn()
  fechaActualizacion!: Date;

  @Column()
  deleted: boolean;

  @ManyToOne(() => {
    try {
      const { User } = require('@src/user/entity/user.entity');
      return User;
    } catch (e) {
      const alt = path.join(__dirname, '..', '..', 'user', 'entity', 'user.entity');
      // try to require compiled JS in dist
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(alt);
      return mod.User || mod.default || mod;
    }
  }, (user: any) => user.base)
  user!: User;

  constructor() {
    this.deleted = false;
  }
}